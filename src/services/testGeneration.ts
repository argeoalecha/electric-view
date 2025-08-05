// AI-Powered Test Generation Service
// Enhanced with AST parsing for Philippine CRM

import { parse, AST_NODE_TYPES } from '@typescript-eslint/typescript-estree'
import type { TSESTree } from '@typescript-eslint/typescript-estree'

export interface TestGenerationRequest {
  sourceCode: string
  filePath: string
  testType: 'unit' | 'integration' | 'component'
  framework: 'jest' | 'cypress' | 'playwright'
  options?: {
    coverageTarget?: number
    includeEdgeCases?: boolean
    mockDependencies?: boolean
    generateDocumentation?: boolean
  }
}

export interface GeneratedTest {
  testCode: string
  testFileName: string
  description: string
  coverageAreas: string[]
  dependencies: string[]
  framework: string
  confidence: number
  suggestions?: string[]
}

export interface TestGenerationResult {
  tests: GeneratedTest[]
  summary: {
    totalTests: number
    estimatedCoverage: number
    generationTime: number
    framework: string
  }
  recommendations: string[]
}

export interface AdvancedCodeAnalysis {
  filePath: string
  fileType: string
  exports: {
    functions: Array<{ name: string; async: boolean; params: string[]; returnType?: string }>
    classes: Array<{ name: string; methods: string[]; extends?: string }>
    variables: Array<{ name: string; type?: string; exported: boolean }>
    components: Array<{ name: string; props: string[]; hooks: string[] }>
  }
  imports: Array<{ module: string; imports: string[]; type: 'default' | 'named' | 'namespace' }>
  complexity: {
    cyclomatic: number
    cognitive: number
    lines: number
    level: 'low' | 'medium' | 'high'
  }
  patterns: {
    hasAsyncCode: boolean
    hasHooks: boolean
    hasAPI: boolean
    hasErrorHandling: boolean
    hasValidation: boolean
    hasPhilippineContext: boolean
  }
  testingSuggestions: string[]
}

export class AITestGenerator {
  private readonly apiEndpoint: string
  private readonly model: string
  private readonly apiKey: string
  private readonly useRealAI: boolean

  constructor(config: { apiEndpoint?: string; model?: string; apiKey?: string; useRealAI?: boolean } = {}) {
    this.apiEndpoint = config.apiEndpoint || 'https://api.anthropic.com/v1/messages'
    this.model = config.model || 'claude-3-haiku-20240307'
    this.apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY || ''
    this.useRealAI = config.useRealAI ?? (!!this.apiKey && process.env.NODE_ENV !== 'development')
  }

  async generateTests(request: TestGenerationRequest): Promise<TestGenerationResult> {
    const startTime = Date.now()

    try {
      // Analyze the source code structure
      const codeAnalysis = this.analyzeSourceCode(request.sourceCode, request.filePath)
      
      // Generate tests based on code analysis
      const generatedTest = await this.generateTestWithAI(request, codeAnalysis)
      
      const generationTime = Date.now() - startTime

      return {
        tests: [generatedTest],
        summary: {
          totalTests: 1,
          estimatedCoverage: this.estimateCoverage(codeAnalysis),
          generationTime,
          framework: request.framework
        },
        recommendations: this.generateRecommendations(codeAnalysis)
      }
    } catch (error) {
      console.error('Test generation failed:', error)
      throw new Error(`Test generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private analyzeSourceCode(sourceCode: string, filePath: string): AdvancedCodeAnalysis {
    try {
      // Parse TypeScript/JavaScript code into AST
      const ast = parse(sourceCode, {
        loc: true,
        range: true,
        tokens: false,
        comment: false,
        jsx: filePath.endsWith('.tsx') || filePath.endsWith('.jsx')
      })

      return this.performAdvancedAnalysis(ast, sourceCode, filePath)
    } catch (error) {
      console.warn('AST parsing failed, falling back to regex analysis:', error)
      // Fallback to basic regex-based analysis
      return this.performBasicAnalysis(sourceCode, filePath)
    }
  }

  private async generateTestWithAI(
    request: TestGenerationRequest, 
    analysis: AdvancedCodeAnalysis
  ): Promise<GeneratedTest> {
    const prompt = this.buildPrompt(request, analysis)
    
    let testCode: string
    let confidence: number
    
    if (this.useRealAI && this.apiKey) {
      try {
        // Use real AI API
        const aiResponse = await this.callClaudeAPI(prompt)
        testCode = this.extractTestCodeFromAIResponse(aiResponse)
        confidence = 0.9 // Higher confidence for AI-generated tests
        
        console.log('✅ Using real AI (Claude) for test generation')
      } catch (error) {
        console.warn('⚠️  AI API failed, falling back to templates:', error)
        testCode = this.generateTestTemplate(request, analysis)
        confidence = this.calculateConfidence(analysis)
      }
    } else {
      // Use template-based approach
      testCode = this.generateTestTemplate(request, analysis)
      confidence = this.calculateConfidence(analysis)
      console.log('📝 Using template-based test generation (no API key or dev mode)')
    }
    
    return {
      testCode,
      testFileName: this.generateTestFileName(request.filePath),
      description: `Generated ${request.testType} tests for ${analysis.filePath}`,
      coverageAreas: this.identifyCoverageAreas(analysis),
      dependencies: this.identifyTestDependencies(request.framework, analysis),
      framework: request.framework,
      confidence,
      suggestions: this.generateSuggestions(analysis)
    }
  }

  private buildPrompt(request: TestGenerationRequest, analysis: AdvancedCodeAnalysis): string {
    const functionsInfo = analysis.exports.functions.map(f => `${f.name}(${f.params.join(', ')})${f.async ? ' [async]' : ''}`).join(', ') || 'None detected'
    const classesInfo = analysis.exports.classes.map(c => `${c.name}(methods: ${c.methods.join(', ') || 'none'})`).join(', ') || 'None detected'
    const componentsInfo = analysis.exports.components.map(c => `${c.name}(props: ${c.props.join(', ') || 'none'})`).join(', ') || 'None detected'
    const importsInfo = analysis.imports.map(i => `${i.module} (${i.imports.join(', ')})`).join(', ') || 'None detected'

    return `You are an expert test engineer specializing in ${request.framework} testing for Philippine CRM applications. Generate comprehensive ${request.testType} tests for the following TypeScript/React code.

## Context
- **File**: ${analysis.filePath}
- **Framework**: ${request.framework} with React Testing Library
- **Type**: ${analysis.fileType}
- **Philippine Business Context**: This is part of a CRM system for Filipino businesses

## Advanced Code Analysis
- **Functions**: ${functionsInfo}
- **Classes**: ${classesInfo}
- **Components**: ${componentsInfo}
- **Imports**: ${importsInfo}
- **Complexity**: ${analysis.complexity.level} (Cyclomatic: ${analysis.complexity.cyclomatic}, Cognitive: ${analysis.complexity.cognitive}, Lines: ${analysis.complexity.lines})
- **Patterns Detected**:
  - Async Operations: ${analysis.patterns.hasAsyncCode}
  - React Hooks: ${analysis.patterns.hasHooks}
  - API Calls: ${analysis.patterns.hasAPI}
  - Error Handling: ${analysis.patterns.hasErrorHandling}
  - Validation: ${analysis.patterns.hasValidation}
  - Philippine Context: ${analysis.patterns.hasPhilippineContext}

## AST-Based Testing Suggestions
${analysis.testingSuggestions.map(suggestion => `- ${suggestion}`).join('\n')}

## Requirements
- Generate ${request.testType} tests with ${request.options?.coverageTarget || 80}% coverage target
- Include edge cases: ${request.options?.includeEdgeCases ?? true}
- Mock dependencies: ${request.options?.mockDependencies ?? true}
- Follow Jest + React Testing Library best practices
- Include Philippine business context where relevant (TIN validation, peso formatting, etc.)
- Add proper TypeScript types
- Include accessibility testing where applicable

## Source Code
\`\`\`typescript
${request.sourceCode}
\`\`\`

## Instructions
1. Generate a complete test file with proper imports
2. Include describe blocks for logical grouping
3. Test all exported functions/components identified in the analysis
4. Add edge cases and error scenarios based on complexity analysis
5. Mock external dependencies appropriately
6. Include async/await testing if patterns detected
7. Add proper test descriptions
8. Follow Philippine CRM business logic patterns
9. Address the AST-based testing suggestions above

Generate ONLY the test code, no explanations. Use proper TypeScript syntax and ${request.framework} testing patterns.`
  }

  private generateTestTemplate(request: TestGenerationRequest, analysis: AdvancedCodeAnalysis): string {
    const { framework, testType } = request

    if (framework === 'jest') {
      if (testType === 'component' && analysis.patterns.hasHooks) {
        return this.generateReactComponentTest(analysis)
      } else if (testType === 'unit') {
        return this.generateUnitTest(analysis)
      } else if (testType === 'integration') {
        return this.generateIntegrationTest(analysis)
      }
    }

    return this.generateBasicTest(analysis)
  }

  private generateReactComponentTest(analysis: AdvancedCodeAnalysis): string {
    const componentName = analysis.exports.components[0]?.name || this.extractComponentName(analysis.filePath)
    const props = analysis.exports.components[0]?.props || []
    
    return `import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import ${componentName} from '${this.getRelativeImportPath(analysis.filePath)}'

// Mock dependencies
${this.generateMocks(analysis)}

describe('${componentName}', () => {
  const user = userEvent.setup()
  
  const defaultProps = {
    ${props.map(prop => `${prop}: 'test-${prop}'`).join(',\n    ')}
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<${componentName} {...defaultProps} />)
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    it('should render with default props', () => {
      const { container } = render(<${componentName} {...defaultProps} />)
      expect(container.firstChild).toBeInTheDocument()
    })
    
    ${props.map(prop => `
    it('should render with ${prop} prop', () => {
      render(<${componentName} {...defaultProps} ${prop}="custom-${prop}" />)
      expect(screen.getByText(/custom-${prop}/i)).toBeInTheDocument()
    })`).join('\n')}
  })

  ${analysis.patterns.hasAPI ? this.generateAPITests(componentName) : ''}
  
  ${analysis.patterns.hasHooks ? this.generateHookTests(componentName) : ''}

  describe('User Interactions', () => {
    it('should handle user interactions', async () => {
      render(<${componentName} {...defaultProps} />)
      
      // Test user interactions
      const button = screen.getByRole('button')
      await user.click(button)
      
      await waitFor(() => {
        expect(screen.getByText(/success/i)).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle loading states', () => {
      render(<${componentName} {...defaultProps} loading={true} />)
      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })

    it('should handle error states', () => {
      render(<${componentName} {...defaultProps} error="Test error" />)
      expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
    
    ${analysis.patterns.hasPhilippineContext ? `
    it('should handle Philippine context correctly', () => {
      render(<${componentName} {...defaultProps} currency="PHP" region="Metro Manila" />)
      expect(screen.getByText(/₱/)).toBeInTheDocument()
      expect(screen.getByText(/Metro Manila/i)).toBeInTheDocument()
    })` : ''}
  })
})
`
  }

  private generateUnitTest(analysis: AdvancedCodeAnalysis): string {
    const moduleName = this.extractModuleName(analysis.filePath)
    const functions = analysis.exports.functions
    
    return `import { ${functions.map(f => f.name).join(', ')} } from '${this.getRelativeImportPath(analysis.filePath)}'

describe('${moduleName}', () => {
  ${functions.map((func) => `
  describe('${func.name}', () => {
    it('should return expected result for valid input', ${func.async ? 'async ' : ''}() => {
      const result = ${func.async ? 'await ' : ''}${func.name}(${func.params.map(() => "'valid input'").join(', ')})
      expect(result).toBeDefined()
    })

    it('should handle edge cases', ${func.async ? 'async ' : ''}() => {
      ${func.async ? 'await ' : ''}expect(() => ${func.name}(${func.params.map(() => 'null').join(', ')})).not.toThrow()
      ${func.async ? 'await ' : ''}expect(() => ${func.name}(${func.params.map(() => 'undefined').join(', ')})).not.toThrow()
      ${func.async ? 'await ' : ''}expect(() => ${func.name}(${func.params.map(() => "''").join(', ')})).not.toThrow()
    })

    ${func.async ? `
    it('should handle async operations and errors', async () => {
      try {
        const result = await ${func.name}(${func.params.map(() => "'async input'").join(', ')})
        expect(result).toBeDefined()
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
    })
    ` : ''}
    
    ${analysis.patterns.hasPhilippineContext ? `
    it('should handle Philippine context correctly', ${func.async ? 'async ' : ''}() => {
      // Test with Philippine-specific inputs
      const result = ${func.async ? 'await ' : ''}${func.name}('123-456-789-000', 'Metro Manila', 'PHP')
      expect(result).toBeDefined()
    })
    ` : ''}
  })
  `).join('\n')}

  describe('Error Handling', () => {
    it('should handle invalid inputs gracefully', () => {
      const firstFunction = ${functions[0]?.name || 'undefined'}
      if (firstFunction) {
        expect(() => firstFunction(null)).not.toThrow()
      }
    })
    
    ${analysis.patterns.hasValidation ? `
    it('should validate inputs properly', () => {
      // Test validation logic
      expect(true).toBe(true) // Placeholder for validation tests
    })
    ` : ''}
  })
})
`
  }

  private generateIntegrationTest(analysis: AdvancedCodeAnalysis): string {
    const functions = analysis.exports.functions
    const classes = analysis.exports.classes
    const exportNames = [...functions.map(f => f.name), ...classes.map(c => c.name)]
    
    return `import { ${exportNames.join(', ')} } from '${this.getRelativeImportPath(analysis.filePath)}'

describe('Integration Tests - ${this.extractModuleName(analysis.filePath)}', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Module Integration', () => {
    it('should integrate with external dependencies', async () => {
      ${functions.length > 0 ? `
      const result = ${functions[0].async ? 'await ' : ''}${functions[0].name}(${functions[0].params.map(() => "'test'").join(', ')})
      expect(result).toBeDefined()
      ` : 'expect(true).toBe(true) // No functions to test'}
    })

    ${analysis.patterns.hasAPI ? `
    it('should handle API integration', async () => {
      // Mock API response
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true })
      })

      ${functions.length > 0 ? `const result = ${functions[0].async ? 'await ' : ''}${functions[0].name}()` : ''}
      expect(fetch).toHaveBeenCalled()
    })
    ` : ''}
    
    ${analysis.patterns.hasPhilippineContext ? `
    it('should handle Philippine business integration', async () => {
      // Test integration with Philippine business logic
      ${functions.length > 0 ? `
      const result = ${functions[0].async ? 'await ' : ''}${functions[0].name}('123-456-789-000', 'Metro Manila')
      expect(result).toBeDefined()
      ` : 'expect(true).toBe(true)'}
    })
    ` : ''}
  })

  describe('End-to-End Workflow', () => {
    it('should complete full workflow successfully', async () => {
      // Test complete workflow with all functions
      ${functions.slice(0, 3).map((func, index) => `
      const result${index} = ${func.async ? 'await ' : ''}${func.name}(${func.params.map(() => `'test${index}'`).join(', ')})
      expect(result${index}).toBeDefined()
      `).join('')}
    })
    
    ${analysis.complexity.level === 'high' ? `
    it('should handle complex scenarios', async () => {
      // Test complex integration scenarios
      expect(true).toBe(true) // Placeholder for complex scenario testing
    })
    ` : ''}
  })
})
`
  }

  private generateBasicTest(analysis: AdvancedCodeAnalysis): string {
    return `describe('${this.extractModuleName(analysis.filePath)}', () => {
  it('should be defined', () => {
    expect(true).toBe(true)
  })
  
  ${analysis.exports.functions.length > 0 ? 
    analysis.exports.functions.map(func => `
  it('should export ${func.name}', () => {
    expect(typeof ${func.name}).toBe('function')
  })`).join('\n') : ''}
})
`
  }

  // Helper methods for code analysis
  private getFileType(filePath: string): string {
    if (filePath.endsWith('.tsx')) return 'react-component'
    if (filePath.endsWith('.ts')) return 'typescript'
    if (filePath.endsWith('.jsx')) return 'react-component'
    if (filePath.endsWith('.js')) return 'javascript'
    return 'unknown'
  }

  private extractExports(sourceCode: string): string[] {
    const exports: string[] = []
    const exportMatches = sourceCode.match(/export\s+(default\s+)?(function|class|const|let|var)\s+(\w+)/g)
    if (exportMatches) {
      exportMatches.forEach(match => {
        const nameMatch = match.match(/(\w+)$/)
        if (nameMatch) exports.push(nameMatch[1])
      })
    }
    return exports
  }

  private extractFunctions(sourceCode: string): string[] {
    const functions: string[] = []
    const functionMatches = sourceCode.match(/(function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*=>|\w+))/g)
    if (functionMatches) {
      functionMatches.forEach(match => {
        const nameMatch = match.match(/(?:function\s+|const\s+)(\w+)/)
        if (nameMatch) functions.push(nameMatch[1])
      })
    }
    return functions
  }

  private extractClasses(sourceCode: string): string[] {
    const classes: string[] = []
    const classMatches = sourceCode.match(/class\s+(\w+)/g)
    if (classMatches) {
      classMatches.forEach(match => {
        const nameMatch = match.match(/class\s+(\w+)/)
        if (nameMatch) classes.push(nameMatch[1])
      })
    }
    return classes
  }

  private extractImports(sourceCode: string): string[] {
    const imports: string[] = []
    const importMatches = sourceCode.match(/import.*from\s+['"]([^'"]+)['"]/g)
    if (importMatches) {
      importMatches.forEach(match => {
        const pathMatch = match.match(/from\s+['"]([^'"]+)['"]/)
        if (pathMatch) imports.push(pathMatch[1])
      })
    }
    return imports
  }

  private estimateComplexity(sourceCode: string): 'low' | 'medium' | 'high' {
    const lines = sourceCode.split('\n').length
    const cyclomaticFactors = (sourceCode.match(/if|else|while|for|switch|catch/g) || []).length
    
    if (lines < 50 && cyclomaticFactors < 5) return 'low'
    if (lines < 200 && cyclomaticFactors < 15) return 'medium'
    return 'high'
  }

  private detectFramework(sourceCode: string): string {
    if (sourceCode.includes('React') || sourceCode.includes('jsx')) return 'react'
    if (sourceCode.includes('Vue')) return 'vue'
    if (sourceCode.includes('Angular')) return 'angular'
    return 'vanilla'
  }

  private generateTestFileName(filePath: string): string {
    const pathParts = filePath.split('/')
    const fileName = pathParts.pop()?.replace(/\.(ts|tsx|js|jsx)$/, '') || 'test'
    const directory = pathParts.join('/')
    return `${directory}/__tests__/${fileName}.test.${filePath.endsWith('x') ? 'tsx' : 'ts'}`
  }

  private identifyCoverageAreas(analysis: AdvancedCodeAnalysis): string[] {
    const areas = ['basic-functionality']
    if (analysis.patterns.hasAsyncCode) areas.push('async-operations')
    if (analysis.patterns.hasHooks) areas.push('react-hooks')
    if (analysis.patterns.hasAPI) areas.push('api-integration')
    if (analysis.patterns.hasErrorHandling) areas.push('error-handling')
    if (analysis.patterns.hasValidation) areas.push('input-validation')
    if (analysis.patterns.hasPhilippineContext) areas.push('philippine-business-logic')
    return areas
  }

  private identifyTestDependencies(framework: string, analysis: AdvancedCodeAnalysis): string[] {
    const deps = ['@testing-library/jest-dom']
    
    if (framework === 'jest') {
      deps.push('jest')
      if (analysis.fileType === 'react-component' || analysis.exports.components.length > 0) {
        deps.push('@testing-library/react', '@testing-library/user-event')
      }
      if (analysis.patterns.hasHooks) {
        deps.push('@testing-library/react-hooks')
      }
      if (analysis.patterns.hasAPI) {
        deps.push('msw') // Mock Service Worker for API mocking
      }
    }
    
    return deps
  }

  private calculateConfidence(analysis: AdvancedCodeAnalysis): number {
    let confidence = 0.7 // Base confidence
    
    if (analysis.complexity.level === 'low') confidence += 0.2
    if (analysis.complexity.level === 'medium') confidence += 0.1
    if (analysis.exports.functions.length > 0) confidence += 0.1
    if (analysis.exports.classes.length > 0) confidence += 0.05
    if (analysis.exports.components.length > 0) confidence += 0.05
    if (analysis.patterns.hasErrorHandling) confidence += 0.05
    if (analysis.patterns.hasValidation) confidence += 0.05
    
    return Math.min(confidence, 1.0)
  }

  private generateSuggestions(analysis: AdvancedCodeAnalysis): string[] {
    // Return the suggestions from advanced analysis
    return analysis.testingSuggestions
  }

  // Helper methods for test generation
  private extractComponentName(filePath: string): string {
    const fileName = filePath.split('/').pop()?.replace(/\.(tsx?|jsx?)$/, '') || 'Component'
    return fileName.charAt(0).toUpperCase() + fileName.slice(1)
  }

  private extractModuleName(filePath: string): string {
    return filePath.split('/').pop()?.replace(/\.(tsx?|jsx?)$/, '') || 'module'
  }

  private getRelativeImportPath(filePath: string): string {
    // Simplified - in real implementation, calculate proper relative path
    return filePath.replace(/^src\//, '@/').replace(/\.(tsx?|jsx?)$/, '')
  }

  private generateMocks(analysis: AdvancedCodeAnalysis): string {
    if (!analysis.patterns.hasAPI && !analysis.patterns.hasHooks) return ''
    
    let mocks = ''
    
    if (analysis.patterns.hasAPI) {
      mocks += `
// Mock API calls
global.fetch = jest.fn()
`
    }
    
    if (analysis.patterns.hasHooks || analysis.fileType === 'react-component') {
      mocks += `
// Mock external dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}))
`
    }
    
    return mocks
  }

  private generateAPITests(componentName: string): string {
    return `
  describe('API Integration', () => {
    it('should handle successful API responses', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ data: 'success' })
      })

      render(<${componentName} />)
      
      await waitFor(() => {
        expect(screen.getByText(/success/i)).toBeInTheDocument()
      })
    })

    it('should handle API errors', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('API Error'))

      render(<${componentName} />)
      
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument()
      })
    })
  })
`
  }

  private generateHookTests(componentName: string): string {
    return `
  describe('React Hooks', () => {
    it('should handle state updates', async () => {
      render(<${componentName} />)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      expect(screen.getByText(/updated/i)).toBeInTheDocument()
    })
  })
`
  }

  private estimateCoverage(analysis: AdvancedCodeAnalysis): number {
    let coverage = 60 // Base coverage
    
    if (analysis.exports.functions.length > 0) coverage += 20
    if (analysis.patterns.hasAsyncCode) coverage += 10
    if (analysis.complexity.level === 'low') coverage += 15
    if (analysis.complexity.level === 'medium') coverage += 10
    if (analysis.patterns.hasErrorHandling) coverage += 5
    if (analysis.patterns.hasValidation) coverage += 5
    
    return Math.min(coverage, 95)
  }

  private generateRecommendations(analysis: AdvancedCodeAnalysis): string[] {
    // Use the enhanced recommendations from AST analysis
    return analysis.testingSuggestions.length > 0 
      ? analysis.testingSuggestions 
      : ['Add comprehensive test coverage', 'Include edge case testing']
  }

  // Real AI API Integration Methods
  private async callClaudeAPI(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Anthropic API key is required for real AI generation')
    }

    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 4000,
        temperature: 0.1, // Low temperature for consistent code generation
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Claude API error (${response.status}): ${errorData}`)
    }

    const data = await response.json()
    
    if (!data.content || !data.content[0]?.text) {
      throw new Error('Invalid response format from Claude API')
    }

    return data.content[0].text
  }

  private extractTestCodeFromAIResponse(aiResponse: string): string {
    // Extract code blocks from AI response
    const codeBlockMatch = aiResponse.match(/```(?:typescript|javascript|tsx|jsx)?\n([\s\S]*?)\n```/)
    
    if (codeBlockMatch && codeBlockMatch[1]) {
      return codeBlockMatch[1].trim()
    }

    // If no code block found, try to extract test-like content
    const lines = aiResponse.split('\n')
    const testStartIndex = lines.findIndex(line => 
      line.includes('describe(') || line.includes('import') || line.includes('test(') || line.includes('it(')
    )
    
    if (testStartIndex !== -1) {
      return lines.slice(testStartIndex).join('\n').trim()
    }

    // Fallback: return the entire response if it looks like code
    if (aiResponse.includes('describe(') || aiResponse.includes('test(') || aiResponse.includes('it(')) {
      return aiResponse.trim()
    }

    throw new Error('Could not extract valid test code from AI response')
  }

  // Advanced AST-based Code Analysis
  private performAdvancedAnalysis(ast: TSESTree.Program, sourceCode: string, filePath: string): AdvancedCodeAnalysis {
    const analysis: AdvancedCodeAnalysis = {
      filePath,
      fileType: this.getFileType(filePath),
      exports: {
        functions: [],
        classes: [],
        variables: [],
        components: []
      },
      imports: [],
      complexity: {
        cyclomatic: 0,
        cognitive: 0,
        lines: sourceCode.split('\n').length,
        level: 'low'
      },
      patterns: {
        hasAsyncCode: false,
        hasHooks: false,
        hasAPI: false,
        hasErrorHandling: false,
        hasValidation: false,
        hasPhilippineContext: false
      },
      testingSuggestions: []
    }

    // Traverse AST and extract information
    this.traverseAST(ast, analysis, sourceCode)
    
    // Calculate complexity levels
    analysis.complexity.level = this.calculateComplexityLevel(analysis.complexity)
    
    // Generate testing suggestions based on analysis
    analysis.testingSuggestions = this.generateTestingSuggestions(analysis)

    return analysis
  }

  private traverseAST(node: TSESTree.Node, analysis: AdvancedCodeAnalysis, sourceCode: string) {
    switch (node.type) {
      case AST_NODE_TYPES.ImportDeclaration:
        this.analyzeImport(node, analysis)
        break
      case AST_NODE_TYPES.ExportNamedDeclaration:
      case AST_NODE_TYPES.ExportDefaultDeclaration:
        this.analyzeExport(node, analysis)
        break
      case AST_NODE_TYPES.FunctionDeclaration:
      case AST_NODE_TYPES.ArrowFunctionExpression:
      case AST_NODE_TYPES.FunctionExpression:
        this.analyzeFunction(node, analysis)
        break
      case AST_NODE_TYPES.ClassDeclaration:
        this.analyzeClass(node, analysis)
        break
      case AST_NODE_TYPES.CallExpression:
        this.analyzeCallExpression(node, analysis)
        break
      case AST_NODE_TYPES.TryStatement:
        analysis.patterns.hasErrorHandling = true
        analysis.complexity.cognitive += 1
        break
      case AST_NODE_TYPES.IfStatement:
      case AST_NODE_TYPES.SwitchStatement:
      case AST_NODE_TYPES.ConditionalExpression:
        analysis.complexity.cyclomatic += 1
        analysis.complexity.cognitive += 1
        break
      case AST_NODE_TYPES.WhileStatement:
      case AST_NODE_TYPES.ForStatement:
      case AST_NODE_TYPES.ForInStatement:
      case AST_NODE_TYPES.ForOfStatement:
        analysis.complexity.cyclomatic += 1
        analysis.complexity.cognitive += 2
        break
    }

    // Recursively traverse child nodes
    for (const key in node) {
      const child = (node as any)[key]
      if (child && typeof child === 'object') {
        if (Array.isArray(child)) {
          child.forEach(item => {
            if (item && typeof item === 'object' && item.type) {
              this.traverseAST(item, analysis, sourceCode)
            }
          })
        } else if (child.type) {
          this.traverseAST(child, analysis, sourceCode)
        }
      }
    }
  }

  private analyzeImport(node: TSESTree.ImportDeclaration, analysis: AdvancedCodeAnalysis) {
    const moduleName = node.source.value as string
    const imports: string[] = []
    let importType: 'default' | 'named' | 'namespace' = 'named'

    if (node.specifiers) {
      for (const specifier of node.specifiers) {
        if (specifier.type === AST_NODE_TYPES.ImportDefaultSpecifier) {
          imports.push(specifier.local.name)
          importType = 'default'
        } else if (specifier.type === AST_NODE_TYPES.ImportSpecifier) {
          imports.push(specifier.imported.name)
        } else if (specifier.type === AST_NODE_TYPES.ImportNamespaceSpecifier) {
          imports.push(`* as ${specifier.local.name}`)
          importType = 'namespace'
        }
      }
    }

    analysis.imports.push({ module: moduleName, imports, type: importType })

    // Check for Philippine context
    if (moduleName.includes('philippines') || moduleName.includes('peso') || moduleName.includes('tin')) {
      analysis.patterns.hasPhilippineContext = true
    }
  }

  private analyzeExport(node: TSESTree.ExportNamedDeclaration | TSESTree.ExportDefaultDeclaration, analysis: AdvancedCodeAnalysis) {
    if (node.type === AST_NODE_TYPES.ExportDefaultDeclaration) {
      if (node.declaration) {
        if (node.declaration.type === AST_NODE_TYPES.FunctionDeclaration && node.declaration.id) {
          analysis.exports.functions.push({
            name: node.declaration.id.name,
            async: node.declaration.async || false,
            params: this.extractFunctionParams(node.declaration),
            returnType: this.extractReturnType(node.declaration)
          })
        } else if (node.declaration.type === AST_NODE_TYPES.ClassDeclaration && node.declaration.id) {
          analysis.exports.classes.push({
            name: node.declaration.id.name,
            methods: this.extractClassMethods(node.declaration),
            extends: this.extractClassExtends(node.declaration)
          })
        }
      }
    }
    // Handle named exports similarly...
  }

  private analyzeFunction(node: TSESTree.FunctionDeclaration | TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression, analysis: AdvancedCodeAnalysis) {
    if (node.async) {
      analysis.patterns.hasAsyncCode = true
    }

    // Check for React component patterns
    if (node.type === AST_NODE_TYPES.FunctionDeclaration && node.id) {
      const functionName = node.id.name
      if (functionName[0] === functionName[0].toUpperCase()) {
        // Likely a React component
        analysis.exports.components.push({
          name: functionName,
          props: this.extractComponentProps(node),
          hooks: this.extractHooksUsage(node)
        })
      }
    }
  }

  private analyzeClass(node: TSESTree.ClassDeclaration, analysis: AdvancedCodeAnalysis) {
    if (node.id) {
      analysis.exports.classes.push({
        name: node.id.name,
        methods: this.extractClassMethods(node),
        extends: this.extractClassExtends(node)
      })
    }
  }

  private analyzeCallExpression(node: TSESTree.CallExpression, analysis: AdvancedCodeAnalysis) {
    // Check for React hooks
    if (node.callee.type === AST_NODE_TYPES.Identifier) {
      const callName = node.callee.name
      if (callName.startsWith('use') && callName[3] === callName[3].toUpperCase()) {
        analysis.patterns.hasHooks = true
      }

      // Check for API calls
      if (['fetch', 'axios', 'request'].includes(callName)) {
        analysis.patterns.hasAPI = true
      }

      // Check for validation
      if (['validate', 'schema', 'zod'].some(term => callName.toLowerCase().includes(term))) {
        analysis.patterns.hasValidation = true
      }
    }

    // Check for Philippine context in function calls
    if (node.callee.type === AST_NODE_TYPES.Identifier) {
      const callName = node.callee.name.toLowerCase()
      if (['formatpeso', 'validatetin', 'philippine', 'manila'].some(term => callName.includes(term))) {
        analysis.patterns.hasPhilippineContext = true
      }
    }
  }

  // Helper methods for AST analysis
  private extractFunctionParams(node: TSESTree.FunctionDeclaration): string[] {
    return node.params.map(param => {
      if (param.type === AST_NODE_TYPES.Identifier) {
        return param.name
      }
      return 'param'
    })
  }

  private extractReturnType(node: TSESTree.FunctionDeclaration): string | undefined {
    // TypeScript return type extraction would go here
    return undefined
  }

  private extractClassMethods(node: TSESTree.ClassDeclaration): string[] {
    const methods: string[] = []
    if (node.body && node.body.body) {
      for (const member of node.body.body) {
        if (member.type === AST_NODE_TYPES.MethodDefinition && member.key.type === AST_NODE_TYPES.Identifier) {
          methods.push(member.key.name)
        }
      }
    }
    return methods
  }

  private extractClassExtends(node: TSESTree.ClassDeclaration): string | undefined {
    if (node.superClass && node.superClass.type === AST_NODE_TYPES.Identifier) {
      return node.superClass.name
    }
    return undefined
  }

  private extractComponentProps(node: TSESTree.FunctionDeclaration | TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression): string[] {
    // Extract React component props - simplified implementation
    const props: string[] = []
    if (node.params && node.params.length > 0) {
      const firstParam = node.params[0]
      if (firstParam.type === AST_NODE_TYPES.ObjectPattern) {
        for (const property of firstParam.properties) {
          if (property.type === AST_NODE_TYPES.Property && property.key.type === AST_NODE_TYPES.Identifier) {
            props.push(property.key.name)
          }
        }
      }
    }
    return props
  }

  private extractHooksUsage(node: TSESTree.FunctionDeclaration | TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression): string[] {
    const hooks: string[] = []
    // This would require a more detailed traversal to find hook usage
    return hooks
  }

  private calculateComplexityLevel(complexity: { cyclomatic: number; cognitive: number; lines: number }): 'low' | 'medium' | 'high' {
    const { cyclomatic, cognitive, lines } = complexity
    
    if (lines < 50 && cyclomatic < 5 && cognitive < 8) return 'low'
    if (lines < 200 && cyclomatic < 15 && cognitive < 25) return 'medium'
    return 'high'
  }

  private generateTestingSuggestions(analysis: AdvancedCodeAnalysis): string[] {
    const suggestions: string[] = []
    
    if (analysis.patterns.hasAsyncCode) {
      suggestions.push('Add comprehensive async/await testing with proper error handling')
    }
    
    if (analysis.patterns.hasHooks) {
      suggestions.push('Use @testing-library/react-hooks for hook testing')
    }
    
    if (analysis.patterns.hasAPI) {
      suggestions.push('Mock API calls and test various response scenarios')
    }
    
    if (analysis.patterns.hasPhilippineContext) {
      suggestions.push('Include Philippine business context in test cases (TIN, peso, regions)')
    }
    
    if (analysis.complexity.level === 'high') {
      suggestions.push('Consider breaking down complex functions for better testability')
    }
    
    if (!analysis.patterns.hasErrorHandling) {
      suggestions.push('Add error handling tests for edge cases')
    }

    return suggestions
  }

  // Fallback to basic regex-based analysis
  private performBasicAnalysis(sourceCode: string, filePath: string): AdvancedCodeAnalysis {
    return {
      filePath,
      fileType: this.getFileType(filePath),
      exports: {
        functions: this.extractFunctions(sourceCode).map(name => ({ name, async: false, params: [] })),
        classes: this.extractClasses(sourceCode).map(name => ({ name, methods: [] })),
        variables: [],
        components: []
      },
      imports: this.extractImports(sourceCode).map(module => ({ module, imports: [], type: 'named' as const })),
      complexity: {
        cyclomatic: 0,
        cognitive: 0,
        lines: sourceCode.split('\n').length,
        level: this.estimateComplexity(sourceCode)
      },
      patterns: {
        hasAsyncCode: /async|await|Promise/.test(sourceCode),
        hasHooks: /use[A-Z]/.test(sourceCode),
        hasAPI: /fetch|axios|api/.test(sourceCode),
        hasErrorHandling: /try|catch|throw/.test(sourceCode),
        hasValidation: /validate|schema|zod/.test(sourceCode),
        hasPhilippineContext: /peso|tin|philippine|manila/i.test(sourceCode)
      },
      testingSuggestions: []
    }
  }
}

// Factory function for easy instantiation
export function createTestGenerator(config?: { 
  apiEndpoint?: string; 
  model?: string; 
  apiKey?: string; 
  useRealAI?: boolean 
}) {
  return new AITestGenerator(config)
}

// Default export
export default AITestGenerator