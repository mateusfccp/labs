import 'dart:io';

import 'package:ansicolor/ansicolor.dart';
import 'package:args/args.dart';
import 'package:mustache_template/mustache.dart';
import 'package:path/path.dart';
import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart';
import 'package:shelf_static/shelf_static.dart';
import 'package:stream_transform/stream_transform.dart';
import 'package:watcher/watcher.dart';
import 'package:yaml/yaml.dart';

final _green = AnsiPen()..green();
final _yellow = AnsiPen()..yellow();
final _red = AnsiPen()..red();
final _bold = AnsiPen()..white(bold: true);

void main(List<String> arguments) async {
  final parser = ArgParser()
    ..addCommand('build')
    ..addCommand('serve');

  final results = parser.parse(arguments);
  final command = results.command;

  if (command == null) {
    stdout.writeln(_red('Error: No command provided. Use "build" or "serve".'));
    exit(1);
  }

  if (command.name == 'build') {
    await _build();
  } else if (command.name == 'serve') {
    await _serve();
  }
}

Future<void> _build() async {
  stdout.writeln('Building labs...');

  final configPath = 'labs.yaml';
  final outputDirName = 'docs';
  final templatePath = 'src/templates/index.mustache';
  final cardTemplatePath = 'src/templates/card.mustache';

  final outputDir = Directory(outputDirName);
  if (outputDir.existsSync()) {
    outputDir.deleteSync(recursive: true);
  }
  outputDir.createSync(recursive: true);

  final configFile = File(configPath);
  if (!configFile.existsSync()) {
    stdout.writeln(_red('Error: Configuration file not found at $configPath'));
    exit(1);
  }

  final configContent = await configFile.readAsString();
  final yaml = loadYaml(configContent);
  final experimentsYaml = yaml['experiments'] as YamlList?;

  if (experimentsYaml == null) {
    stdout.writeln(_red('Error: No experiments found in $configPath'));
    exit(1);
  }

  final experimentsDir = Directory('src/experiments');
  if (!experimentsDir.existsSync()) {
    stdout.writeln(_red('Error: "src/experiments" directory not found.'));
    exit(1);
  }

  final entities = await experimentsDir.list().toList();

  final existingApps = {
    for (final entity in entities)
      if (entity is Directory) 'src/experiments/${basename(entity.path)}',
  };

  for (final experiment in experimentsYaml) {
    final dirName = experiment['slug'];
    final fullPath = join('src/experiments', dirName);
    if (!Directory(fullPath).existsSync()) {
      stdout.writeln(
        _yellow('Warning: Configured app "$fullPath" does not exist.'),
      );
    }
  }

  final configuredDirNames = {
    for (final experiment in experimentsYaml) experiment['slug'] as String,
  };
  for (final appPath in existingApps) {
    final dirName = basename(appPath);
    if (!configuredDirNames.contains(dirName)) {
      stdout.writeln(
        _yellow('Warning: App "$appPath" is not listed in $configPath'),
      );
    }
  }

  final experimentsData = <Map<String, Object?>>[];
  final allTags = <String>{};

  for (final experiment in experimentsYaml) {
    final name = experiment['name'] as String;
    final slug = experiment['slug'] as String;
    final desc = experiment['description'] as String;
    final thumbnailName = experiment['thumbnail'] as String?;

    final sourcePath = join('src/experiments', slug);
    final destPath = join(outputDir.path, slug);

    if (Directory(sourcePath).existsSync()) {
      await _copyDirectory(Directory(sourcePath), Directory(destPath));

      final generator = File(join(sourcePath, 'generate.dart'));
      if (generator.existsSync()) {
        stdout.writeln('Running generator for $slug...');
        final destIndex = File(join(destPath, 'index.html')).absolute.path;
        final result = await Process.run('dart', ['generate.dart', destIndex],
            workingDirectory: sourcePath);
        if (result.exitCode != 0) {
          stdout.writeln(
            _red('Error: Generator for $slug failed:\n${result.stderr}'),
          );
        }
      }

      stdout.writeln('Built $slug to /docs');
    } else {
      stdout.writeln(
        _yellow('Warning: Source directory not found: $sourcePath'),
      );
    }

    String? thumbnailUrl;
    if (thumbnailName != null) {
      thumbnailUrl = '$slug/$thumbnailName';
    }

    final tags = (experiment['tags'] as YamlList?)?.cast<String>() ?? [];
    allTags.addAll(tags);

    experimentsData.add({
      'name': name,
      'description': desc,
      'url': slug,
      'thumbnail': thumbnailUrl,
      'hasThumbnail': thumbnailUrl != null,
      'tags': [
        for (final tag in tags) {'name': tag},
      ],
    });
  }

  final staticDir = Directory('src/static');
  if (staticDir.existsSync()) {
    final docsStaticDir = Directory(join(outputDir.path, 'static'));
    await _copyDirectory(staticDir, docsStaticDir);
    stdout.writeln('Copied static assets');
  }

  final templateFile = File(templatePath);
  final cardTemplateFile = File(cardTemplatePath);

  if (!templateFile.existsSync() || !cardTemplateFile.existsSync()) {
    stdout.writeln(_red('Error: Template files not found'));
    exit(1);
  }

  final templateSource = await templateFile.readAsString();
  final cardTemplateSource = await cardTemplateFile.readAsString();

  final template = Template(
    templateSource,
    partialResolver: (name) {
      if (name == 'card') return Template(cardTemplateSource);
      return null;
    },
  );

  final output = template.renderString({
    'experiments': experimentsData,
    'allTags': [
      for (final tag in allTags) {'name': tag},
    ],
  });

  final outputFile = File(join(outputDir.path, 'index.html'));
  await outputFile.writeAsString(output);
  stdout.writeln(_green('Successfully built to ${outputDir.path}'));
}

Future<void> _serve() async {
  await _build();

  final handler = createStaticHandler('docs', defaultDocument: 'index.html');
  final pipeline = Pipeline().addMiddleware(logRequests()).addHandler(handler);

  final server = await serve(pipeline, 'localhost', 8080);
  stdout.write('Serving /docs at ');
  stdout.writeln(_bold('http://${server.address.host}:${server.port}'));
  stdout.writeln('Press Ctrl+C to stop.');

  final srcWatcher = DirectoryWatcher('src');
  final configWatcher = FileWatcher('labs.yaml');

  bool isBuilding = false;

  Future<void> triggerBuild() async {
    if (isBuilding) return;
    isBuilding = true;
    stdout.writeln(_bold('\nChange detected. Rebuilding...'));
    try {
      await _build();
    } catch (error) {
      stdout.writeln(_red('Build failed: $error'));
    } finally {
      isBuilding = false;
    }
  }

  final subscription = srcWatcher.events
      .merge(configWatcher.events)
      .debounce(Duration(milliseconds: 200))
      .listen((event) {
        triggerBuild();
      });

  await ProcessSignal.sigint.watch().first;
  await subscription.cancel();

  stdout.writeln(_bold('\nShutting down server...'));
  exit(0);
}

Future<void> _copyDirectory(Directory source, Directory destination) async {
  await destination.create(recursive: true);
  await for (final entity in source.list(recursive: false)) {
    final newPath = join(destination.path, basename(entity.path));
    if (entity is Directory) {
      await _copyDirectory(entity, Directory(newPath));
    } else if (entity is File) {
      await entity.copy(newPath);
    }
  }
}
