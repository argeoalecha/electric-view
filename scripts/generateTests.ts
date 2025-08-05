#!/usr/bin/env tsx
// Test Generation CLI Tool
// Usage: npm run generate-tests <file-path> [options]

import fs from 'fs'
import path from 'path'
import { AITestGenerator, TestGenerationRequest } from '../src/services/testGeneration'

interface CLIOptions {
  filePath: string
  testType: 'unit' | 'integration' | 'component'
  framework: 'jest' | 'cypress' | 'playwright'
  outputDir?: string
  dryRun?: boolean
  verbose?: boolean
}

class TestGenerationCLI {
  private generator: AITestGenerator

  constructor() {
    this.generator = new AITestGenerator()
  }

  async run(args: string[]) {
    try {
      const options = this.parseArgs(args)
      await this.generateTestsForFile(options)
    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error')
      process.exit(1)
    }
  }

  private parseArgs(args: string[]): CLIOptions {
    if (args.length < 1) {
      this.printUsage()
      process.exit(1)
    }

    const filePath = args[0]
    const options: CLIOptions = {
      filePath,
      testType: 'unit',
      framework: 'jest'
    }

    // Parse additional arguments
    for (let i = 1; i < args.length; i++) {
      const arg = args[i]
      
      switch (arg) {
        case '--type':
          options.testType = args[++i] as 'unit' | 'integration' | 'component'
          break
        case '--framework':
          options.framework = args[++i] as 'jest' | 'cypress' | 'playwright'
          break
        case '--output':
          options.outputDir = args[++i]
          break
        case '--dry-run':
          options.dryRun = true
          break
        case '--verbose':
          options.verbose = true
          break
      }
    }

    return options
  }

  private async generateTestsForFile(options: CLIOptions) {
    const { filePath, testType, framework, outputDir, dryRun, verbose } = options

    // Validate file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`)
    }

    // Read source code
    const sourceCode = fs.readFileSync(filePath, 'utf-8')
    
    if (verbose) {
      console.log(`📁 Analyzing file: ${filePath}`)
      console.log(`🧪 Test type: ${testType}`)
      console.log(`🔧 Framework: ${framework}`)
    }

    // Generate test request
    const request: TestGenerationRequest = {
      sourceCode,
      filePath,
      testType,
      framework,
      options: {
        coverageTarget: 85,
        includeEdgeCases: true,
        mockDependencies: true,
        generateDocumentation: true
      }
    }

    console.log('🤖 Generating tests with AI...')
    
    // Generate tests
    const result = await this.generator.generateTests(request)
    
    console.log('✅ Test generation completed!')
    console.log(`📊 Generated ${result.tests.length} test(s)`)
    console.log(`📈 Estimated coverage: ${result.summary.estimatedCoverage}%`)
    console.log(`⏱️  Generation time: ${result.summary.generationTime}ms`)

    // Display generated tests
    for (const test of result.tests) {
      console.log(`\n📝 Test: ${test.testFileName}`)
      console.log(`📋 Description: ${test.description}`)
      console.log(`🎯 Confidence: ${(test.confidence * 100).toFixed(1)}%`)
      console.log(`📦 Dependencies: ${test.dependencies.join(', ')}`)
      
      if (verbose) {
        console.log(`🔍 Coverage areas: ${test.coverageAreas.join(', ')}`)
        if (test.suggestions?.length) {
          console.log('💡 Suggestions:')
          test.suggestions.forEach(suggestion => console.log(`   - ${suggestion}`))
        }
      }

      if (dryRun) {
        console.log('\n📄 Generated test code:')
        console.log('─'.repeat(80))
        console.log(test.testCode)
        console.log('─'.repeat(80))
      } else {
        // Write test file
        const testDir = outputDir || path.dirname(test.testFileName)
        const testFilePath = path.join(testDir, path.basename(test.testFileName))
        
        // Ensure directory exists
        fs.mkdirSync(path.dirname(testFilePath), { recursive: true })
        
        // Write test file
        fs.writeFileSync(testFilePath, test.testCode)
        console.log(`💾 Test written to: ${testFilePath}`)
      }
    }

    // Display recommendations
    if (result.recommendations.length > 0) {
      console.log('\n🎯 Recommendations:')
      result.recommendations.forEach(rec => console.log(`   - ${rec}`))
    }
  }

  private printUsage() {
    console.log(`
🧪 Philippine CRM Test Generator

Usage: npm run generate-tests <file-path> [options]

Arguments:
  file-path              Path to the source file to generate tests for

Options:
  --type <type>          Test type: unit|integration|component (default: unit)
  --framework <fw>       Framework: jest|cypress|playwright (default: jest) 
  --output <dir>         Output directory for generated tests
  --dry-run              Show generated tests without writing files
  --verbose              Show detailed output

Examples:
  npm run generate-tests src/utils/leadScoring.ts
  npm run generate-tests src/components/UI/ExportButton.tsx --type component
  npm run generate-tests src/services/testGeneration.ts --type unit --verbose
  npm run generate-tests src/app/dashboard/page.tsx --type integration --dry-run
`)
  }
}

// Run CLI if this file is executed directly
if (require.main === module) {
  const cli = new TestGenerationCLI()
  cli.run(process.argv.slice(2))
}

export default TestGenerationCLI