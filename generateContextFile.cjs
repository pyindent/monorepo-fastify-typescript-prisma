//src/generateContextFile.js

/*
  Script para gerar um arquivo de contexto contendo todos os arquivos relevantes de um projeto Node.js,
  excluindo diretórios ou arquivos que não sejam código-fonte (caches, libs, logs, bancos de dados etc.).
  O arquivo final seguirá o formato: context_{nomeDoProjeto}_v{versãoOuTimestamp}.txt

  Modo de uso:
    1. Salve este script na raiz do projeto.
    2. No terminal, execute: node generateContextFile.js
    3. Será gerado um arquivo "context_{nomeDoProjeto}_v{...}.txt" na raiz do projeto,
       que conterá o conteúdo de todos os arquivos aceitos pelo filtro.

  Observações:
    - Diretórios ignorados por padrão:
        • node_modules
        • instâncias de cache (instances/, logs/, files-received/)
        • diretórios ocultos (.git, .idea, etc.)
        • pastas de build (dist, build, coverage)
    - Extensões ignoradas por padrão:
        • imagens (.png, .jpg, .jpeg, .gif, .svg, .webp)
        • fontes (.woff, .woff2, .eot, .ttf)
        • bancos/logs (.db, .sqlite, .log, .lock, .pid, .socket)
        • pacotes comprimidos .zip
        • arquivos de build do TypeScript .tsbuildinfo
    - Se desejar adicionar ou remover filtros, ajuste as listas "ignoredDirectories" e "ignoredExtensions"
      e a lógica dentro de "shouldIgnoreFile".
    - Para determinar o nome do projeto e a versão, o script tenta ler do package.json (caso exista).
    - Caso não encontre, serão usados valores default.
    - Foi adicionado tratamento de erro tanto ao ler diretórios (readdirSync) quanto ao ler arquivos (readFileSync),
      para evitar que um arquivo/socket/dispositivo quebre o script.
*/

const fs = require('fs');
const path = require('path');

// -------------------------------------------------------
// 1. CONFIGURAÇÃO DE IGNORAR DIRETÓRIOS E EXTENSÕES
// -------------------------------------------------------
const ignoredDirectories = new Set([
  'node_modules',
  'logs',
  'files-received',
  'instances',
  'dist',
  'build',
  'coverage',
  'public'
]);

const ignoredExtensions = new Set([
  // Imagens
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp',
  // Fontes
  '.woff', '.woff2', '.eot', '.ttf',
  // Bancos de dados, logs, sockets
  '.db', '.sqlite', '.log', '.lock', '.pid', '.socket',
  // ZIP
  '.zip',
  // Build do TS
  '.tsbuildinfo'
]);

function main() {
  // 1. Tenta capturar o nome e a versão do projeto a partir do package.json
  const { projectName, projectVersion } = getProjectInfo();

  // 2. Gera um sufixo de versão (padrão = data/hora) para o arquivo de contexto
  const versionSuffix = generateVersionSuffix(projectVersion);

  // 3. Caminho e nome final do arquivo de contexto
  const outputFileName = `context_${projectName}_v${versionSuffix}.txt`;
  const outputFilePath = path.resolve(process.cwd(), outputFileName);

  // 4. Busca todos os arquivos válidos recursivamente
  const allFiles = listAllFiles(process.cwd());

  // 5. Gera o conteúdo final
  let finalContent = '';
  for (const file of allFiles) {
    // Tenta ler o conteúdo do arquivo. Se falhar, pula.
    let fileContent;
    try {
      fileContent = fs.readFileSync(file, 'utf-8');
    } catch (error) {
      console.warn(`Não foi possível ler o arquivo: ${file} (motivo: ${error.code || error.message}). Será ignorado.`);
      continue; // Pula este arquivo
    }

    finalContent += `\n// Filename: ${path.basename(file)} - Path: ${path.relative(process.cwd(), file)}\n`;
    finalContent += fileContent + '\n';
  }

  // 6. Escreve o conteúdo no arquivo de contexto
  fs.writeFileSync(outputFilePath, finalContent, 'utf-8');

  console.log(`Arquivo de contexto gerado com sucesso: ${outputFileName}`);
}

/**
 * Obtém informações de nome do projeto e versão do package.json, se existir.
 */
function getProjectInfo() {
  let projectName = 'meuProjeto';
  let projectVersion = '';

  try {
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    if (packageJson.name) {
      projectName = packageJson.name.replace(/[\s]/g, '_');
    }
    if (packageJson.version) {
      projectVersion = packageJson.version;
    }
  } catch (err) {
    // Se não tiver package.json ou falhar a leitura, usamos valores padrão
  }

  return { projectName, projectVersion };
}

/**
 * Gera um sufixo de versão baseado na versão do projeto ou um timestamp.
 */
function generateVersionSuffix(projectVersion) {
  if (projectVersion) {
    // Ex: "1.0.2" -> "1_0_2"
    return projectVersion.replace(/\./g, '_');
  }
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const sec = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}_${hour}${min}${sec}`;
}

/**
 * Lista todos os arquivos (recursivamente) que não devem ser ignorados.
 */
function listAllFiles(dir, fileList = []) {
  let files;
  try {
    files = fs.readdirSync(dir);
  } catch (err) {
    // Se ocorrer erro ao ler o diretório, simplesmente ignora
    return fileList;
  }

  for (const file of files) {
    const fullPath = path.join(dir, file);

    let stats;
    try {
      stats = fs.statSync(fullPath);
    } catch (err) {
      // Se o arquivo ou diretório não existir ou se der outro erro, ignora
      continue;
    }

    if (stats.isDirectory()) {
      // Se for um diretório ignorável (por nome) ou oculto (inicia com ponto), pula
      if (ignoredDirectories.has(file) || file.startsWith('.')) {
        continue;
      }
      listAllFiles(fullPath, fileList); // Percorre o subdiretório
    } else {
      // Se for arquivo, verifica se deve ser ignorado
      if (!shouldIgnoreFile(fullPath)) {
        fileList.push(fullPath);
      }
    }
  }

  return fileList;
}

/**
 * Verifica se o arquivo deve ser ignorado baseado na extensão ou outras regras.
 */
function shouldIgnoreFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const base = path.basename(filePath).toLowerCase();

  // Se a extensão estiver na lista de ignorados, pula
  if (ignoredExtensions.has(ext)) {
    return true;
  }

  // Ignora especificamente o arquivo package-lock.json
  if (base === 'package-lock.json') {
    return true;
  }

  // Ignora esse próprio script
  if (base === path.basename(__filename).toLowerCase()) {
    return true;
  }

  return false;
}

// Executa o script
main();
