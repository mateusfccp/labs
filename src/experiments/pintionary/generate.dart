import 'dart:io';
import 'package:yaml/yaml.dart';
import 'package:mustache_template/mustache.dart';
import 'package:markdown/markdown.dart';

void main(List<String> args) async {
  final String outputPath = args.isNotEmpty ? args[0] : 'index.html';

  final dataFile = File('data.yaml');
  if (!dataFile.existsSync()) {
    print('data.yaml not found!');
    exit(1);
  }

  final templateFile = File('template.html');
  if (!templateFile.existsSync()) {
    print('template.html not found!');
    exit(1);
  }

  final content = dataFile.readAsStringSync();
  final yamlMap = loadYamlDocument(content).contents.value as YamlMap;
  
  final entries = <String, Map<String, dynamic>>{};
  final triggerMap = <String, Map<String, dynamic>>{};

  void addTrigger(String trigger, String targetKey, bool properNoun) {
    if (!triggerMap.containsKey(trigger)) {
      triggerMap[trigger] = {
        'targetKeys': <String>[],
        'properNoun': properNoun,
      };
    } else {
      triggerMap[trigger]!['properNoun'] =
          (triggerMap[trigger]!['properNoun'] as bool) || properNoun;
    }
    if (!(triggerMap[trigger]!['targetKeys'] as List<String>).contains(targetKey)) {
      (triggerMap[trigger]!['targetKeys'] as List<String>).add(targetKey);
    }
  }

  for (final key in yamlMap.keys) {
    final value = yamlMap[key];
    final keyStr = key.toString();

    if (value is String) {
      entries[keyStr] = {
        'content': value,
        'properNoun': false,
        'aliases': <String>[],
      };
      addTrigger(keyStr, keyStr, false);
    } else if (value is YamlMap) {
      final isProperNoun = value['properNoun'] == true;
      final aliases = <String>[];
      if (value['aliases'] != null) {
        aliases.addAll((value['aliases'] as YamlList).cast<String>());
      }
      entries[keyStr] = {
        'content': value['content']?.toString() ?? '',
        'properNoun': isProperNoun,
        'aliases': aliases,
      };
      addTrigger(keyStr, keyStr, isProperNoun);
      for (final alias in aliases) {
        addTrigger(alias, keyStr, isProperNoun);
      }
    }
  }

  // Sort trigger words by length descending to match longest terms first
  final triggers = triggerMap.keys.toList()..sort((a, b) => b.length.compareTo(a.length));

  final processedEntriesList = <Map<String, String>>[];

  // Sort alphabetically for display
  final sortedKeys = entries.keys.toList()..sort((a, b) => a.toLowerCase().compareTo(b.toLowerCase()));

  for (final key in sortedKeys) {
    // Protect LaTeX math blocks from Markdown processing (especially backslashes)
    final mathBlocks = <String>[];
    String contentWithPlaceholders = entries[key]!['content'] as String;
    contentWithPlaceholders = contentWithPlaceholders.replaceAllMapped(
      RegExp(r'\$\$.*?\$\$', dotAll: true),
      (match) {
        mathBlocks.add(match.group(0)!);
        return 'MATHBLOCK${mathBlocks.length - 1}MATHBLOCK';
      },
    );

    // Parse Markdown to HTML
    String definitionHtml = markdownToHtml(contentWithPlaceholders);

    // Restore math blocks
    for (int i = 0; i < mathBlocks.length; i++) {
      definitionHtml = definitionHtml.replaceFirst(
        'MATHBLOCK${i}MATHBLOCK',
        mathBlocks[i],
      );
    }


    for (final trigger in triggers) {
      final targets = triggerMap[trigger]!['targetKeys'] as List<String>;
      // Don't hyperlink if the ONLY target is itself
      if (targets.length == 1 && targets.first == key) continue;

      final isProperNoun = triggerMap[trigger]!['properNoun'] as bool;
      final escapedTerm = RegExp.escape(trigger);
      // Group 1: <a> tags (to be ignored)
      // Group 2: Any other HTML tags (to be ignored)
      // Group 3: The term to be replaced
      final regex = RegExp(
        '(<a\\b[^>]*>.*?</a>)|(<[^>]+>)|(\\b$escapedTerm\\b)',
        caseSensitive: isProperNoun,
      );

      definitionHtml = definitionHtml.replaceAllMapped(regex, (match) {
        if (match.group(1) != null) {
          return match.group(1)!;
        } else if (match.group(2) != null) {
          return match.group(2)!;
        } else {
          final text = match.group(3)!;
          final validTargets = targets.where((t) => t != key).toList();
          
          if (validTargets.isEmpty) {
            return text; // Should not happen due to earlier continue, but safe
          } else if (validTargets.length == 1) {
            return '<a href="#${validTargets.first}" class="dict-link">$text</a>';
          } else {
            final targetsStr = validTargets.join(',');
            return '<a href="#" class="dict-link disambiguate" data-targets="$targetsStr">$text</a>';
          }
        }
      });
    }

    processedEntriesList.add({
      'key': key,
      'definition': definitionHtml,
    });
  }

  final templateSource = templateFile.readAsStringSync();
  final template = Template(templateSource);

  final output = template.renderString({
    'entries': processedEntriesList,
  });

  final File outputF = File(outputPath);
  if (!outputF.parent.existsSync()) {
    outputF.parent.createSync(recursive: true);
  }
  outputF.writeAsStringSync(output);
  print('Successfully generated $outputPath');
}
