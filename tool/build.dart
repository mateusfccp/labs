import 'dart:io';
import 'package:args/args.dart';
import 'package:yaml/yaml.dart';
import 'package:path/path.dart' as p;

void main(List<String> arguments) async {
  final parser = ArgParser()
    ..addOption('config', abbr: 'c', defaultsTo: 'labs.yaml', help: 'Path to configuration file')
    ..addOption('template', abbr: 't', defaultsTo: 'templates/index.html', help: 'Path to template file')
    ..addOption('output-dir', abbr: 'o', defaultsTo: 'docs', help: 'Path to output directory');

  final argResults = parser.parse(arguments);
  final configPath = argResults['config'];
  final templatePath = argResults['template'];
  final outputDirName = argResults['output-dir'];

  final outputDir = Directory(outputDirName);
  if (outputDir.existsSync()) {
    outputDir.deleteSync(recursive: true);
  }
  outputDir.createSync(recursive: true);

  // 1. Read Configuration
  final configFile = File(configPath);
  if (!configFile.existsSync()) {
    print('Error: Configuration file not found at $configPath');
    exit(1);
  }

  final configContent = await configFile.readAsString();
  final yaml = loadYaml(configContent);
  final experiments = yaml['experiments'] as YamlList?;

  if (experiments == null) {
    print('Warning: No experiments found in $configPath');
    exit(0);
  }

  // 2. Validate and Scan
  final experimentsDir = Directory('experiments');
  if (!experimentsDir.existsSync()) {
    print('Error: "experiments" directory not found.');
    exit(1);
  }

  final entities = await experimentsDir.list().toList();
  final existingApps = entities.whereType<Directory>().map((e) => 'experiments/${p.basename(e.path)}').toSet();
  
  // Check for configured apps that don't exist
  for (final exp in experiments) {
    final path = exp['path'];
    if (!Directory(path).existsSync()) {
      print('Warning: Configured app "$path" does not exist.');
    }
  }

  // Check for existing apps that are not configured
  final configuredPaths = experiments.map((e) => e['path']).toSet();
  for (final appPath in existingApps) {
    if (!configuredPaths.contains(appPath)) {
       print('Warning: App "$appPath" is not listed in $configPath');
    }
  }

  // 3. Generate Content and Copy Apps
  final sb = StringBuffer();
  for (final exp in experiments) {
    final name = exp['name'] ?? 'Unknown';
    final path = exp['path'] as String;
    final desc = exp['description'] ?? '';
    final thumbPath = exp['thumbnail'] as String?;

    // Determine destination in docs/
    final appDirName = p.basename(path);
    final destPath = p.join(outputDir.path, appDirName);

    // Copy app
    if (Directory(path).existsSync()) {
        await _copyDirectory(Directory(path), Directory(destPath));
    }

    // Determine thumbnail path for HTML (relative to docs root)
    String? htmlThumbPath;
    if (thumbPath != null) {
        if (p.isWithin(path, thumbPath)) {
            // If thumb is inside the app, it's already copied
            // path: experiments/projections, thumb: experiments/projections/img.png
            // relative: img.png
            // html: projections/img.png
            final relative = p.relative(thumbPath, from: path);
            htmlThumbPath = '$appDirName/$relative';
        } else {
            // Logic for external thumbs if needed (not active now)
            htmlThumbPath = thumbPath; 
        }
    }

    sb.writeln('<a href="$appDirName/index.html" class="card">');
    sb.writeln('  <div class="card-img">');
    if (htmlThumbPath != null) {
       sb.writeln('    <img src="$htmlThumbPath" alt="$name">');
    } else {
       sb.writeln('    <span>$name</span>');
    }
    sb.writeln('  </div>');
    sb.writeln('  <div class="card-content">');
    sb.writeln('    <h2 class="card-title">$name</h2>');
    sb.writeln('    <p class="card-desc">$desc</p>');
    sb.writeln('  </div>');
    sb.writeln('</a>');
  }

  // 4. Render Template
  final templateFile = File(templatePath);
  if (!templateFile.existsSync()) {
      print('Error: Template file not found at $templatePath');
      exit(1);
  }
  
  var template = await templateFile.readAsString();
  template = template.replaceFirst('<!-- APP_GRID -->', sb.toString());

  // 5. Write Output
  final outputFile = File(p.join(outputDir.path, 'index.html'));
  await outputFile.writeAsString(template);
  print('Successfully built to ${outputDir.path}');
}

Future<void> _copyDirectory(Directory source, Directory destination) async {
  await destination.create(recursive: true);
  await for (final entity in source.list(recursive: false)) {
    final newPath = p.join(destination.path, p.basename(entity.path));
    if (entity is Directory) {
      await _copyDirectory(entity, Directory(newPath));
    } else if (entity is File) {
      await entity.copy(newPath);
    }
  }
}
