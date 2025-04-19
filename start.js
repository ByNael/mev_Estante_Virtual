const { spawn } = require("child_process")
const path = require("path")
const fs = require("fs")

// Cores para o console
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",

  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
}

console.log(`${colors.bright}${colors.cyan}=== Iniciando Minha Estante Virtual ====${colors.reset}`)

// Verificar se as pastas existem
if (!fs.existsSync(path.join(__dirname, "frontend"))) {
  console.error(`${colors.red}Erro: Pasta 'frontend' não encontrada${colors.reset}`)
  process.exit(1)
}

if (!fs.existsSync(path.join(__dirname, "backend"))) {
  console.error(`${colors.red}Erro: Pasta 'backend' não encontrada${colors.reset}`)
  process.exit(1)
}

// Iniciar o backend
console.log(`${colors.yellow}Iniciando o servidor backend...${colors.reset}`)
const backend = spawn("npm", ["start"], {
  cwd: path.join(__dirname, "backend"),
  shell: true,
  stdio: "pipe",
})

backend.stdout.on("data", (data) => {
  console.log(`${colors.green}[Backend] ${colors.reset}${data}`)
})

backend.stderr.on("data", (data) => {
  console.error(`${colors.red}[Backend Error] ${colors.reset}${data}`)
})

// Esperar um pouco antes de iniciar o frontend
setTimeout(() => {
  console.log(`${colors.yellow}Iniciando o cliente frontend...${colors.reset}`)
  const frontend = spawn("npm", ["start"], {
    cwd: path.join(__dirname, "frontend"),
    shell: true,
    stdio: "pipe",
  })

  frontend.stdout.on("data", (data) => {
    console.log(`${colors.blue}[Frontend] ${colors.reset}${data}`)
  })

  frontend.stderr.on("data", (data) => {
    console.error(`${colors.red}[Frontend Error] ${colors.reset}${data}`)
  })

  // Lidar com o encerramento do processo
  process.on("SIGINT", () => {
    console.log(`${colors.yellow}Encerrando os serviços...${colors.reset}`)
    backend.kill()
    frontend.kill()
    process.exit(0)
  })
}, 3000)

console.log(`${colors.magenta}Aguarde enquanto os serviços são iniciados...${colors.reset}`)
