/**
 * Configuración de Jest para LuxuryWatch Backend
 * Configuración global y setup para tests
 */

const path = require('path');

// Configuración básica de Jest
module.exports = {
  // Entorno de pruebas
  testEnvironment: 'node',
  
  // Directorios donde buscar tests
  testMatch: [
    '**/tests/**/*.(test|spec).js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // Directorios a ignorar
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],
  
  // Coverage
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json'
  ],
  collectCoverageFrom: [
    'src/**/*.{js}',
    '!src/app.js', // Excluir app principal para simplificar
    '!src/utils/logger.js', // Excluir logger
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  
  // Configuración de setup
  setupFilesAfterEnv: [
    path.join(__dirname, 'tests/setup.js')
  ],
  
  // Transformaciones
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // Variables de entorno para tests
  testEnvironmentOptions: {
    NODE_ENV: 'test'
  },
  
  // Timeout para tests
  testTimeout: 10000,
  
  // Configuración de reporteres
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './coverage',
        filename: 'report.html',
        expand: true
      }
    ]
  ]
};