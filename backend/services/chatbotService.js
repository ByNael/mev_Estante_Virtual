const { NlpManager } = require('node-nlp');
const livros = require('../data/livros.json');

// Inicializa o NLP Manager
const manager = new NlpManager({ languages: ['pt'], forceNER: true });

// Lista de gêneros e tags dos livros mockados
const generos = [...new Set(livros.map(l => l.genero.toLowerCase()))];
const tags = [...new Set(livros.flatMap(l => l.tags.map(t => t.toLowerCase())))];

// Treinamento simples para intenções e definição de entidades
function treinarModelo() {
  // Entidade de gênero
  manager.addNamedEntityText('genero', generos, ['pt'], generos);
  // Entidade de tag
  manager.addNamedEntityText('tag', tags, ['pt'], tags);

  // Exemplos de intenções
  generos.forEach(genero => {
    manager.addDocument('pt', `Me recomende um livro de ${genero}`, 'recomendar.genero');
    manager.addDocument('pt', `Quero um livro de ${genero}`, 'recomendar.genero');
    manager.addDocument('pt', `Tem algum ${genero}?`, 'recomendar.genero');
  });
  tags.forEach(tag => {
    manager.addDocument('pt', `Quero um livro com ${tag}`, 'recomendar.tag');
    manager.addDocument('pt', `Tem algum livro com ${tag}?`, 'recomendar.tag');
  });
  manager.addDocument('pt', 'Quero algo parecido com %titulo%', 'recomendar.similar');
  manager.addDocument('pt', 'Me indique um livro como %titulo%', 'recomendar.similar');
  manager.addDocument('pt', 'Tem algum romance com final surpreendente?', 'recomendar.tag');
  // Adicione mais exemplos conforme necessário
}

let modeloTreinado = false;

function extrairGeneroOuTagManual(mensagem) {
  // Busca manual por gênero ou tag na mensagem
  const msg = mensagem.toLowerCase();
  const generosEncontrados = generos.filter(g => msg.includes(g));
  const tagsEncontradas = tags.filter(t => msg.includes(t));
  
  if (generosEncontrados.length > 0) {
    return { tipo: 'generos', valores: generosEncontrados };
  }
  if (tagsEncontradas.length > 0) {
    return { tipo: 'tags', valores: tagsEncontradas };
  }
  return null;
}

function extrairNumero(mensagem) {
  // Extrai números da mensagem (1-99)
  const numeros = mensagem.match(/\b\d{1,2}\b/g);
  return numeros ? parseInt(numeros[0]) : null;
}

async function processarMensagem(mensagem, contexto = {}) {
  if (!modeloTreinado) {
    treinarModelo();
    await manager.train();
    modeloTreinado = true;
  }
  
  const respostaNLP = await manager.process('pt', mensagem);
  let resposta = '';
  let livrosRecomendados = [];
  const numeroSolicitado = extrairNumero(mensagem);

  // Primeiro, tenta extrair gênero ou tag manualmente (fallback)
  const extraido = extrairGeneroOuTagManual(mensagem);
  
  if (extraido?.tipo === 'generos') {
    // Busca livros que correspondam a qualquer um dos gêneros mencionados
    livrosRecomendados = livros.filter(l => 
      extraido.valores.some(genero => l.genero.toLowerCase().includes(genero))
    );
    
    if (livrosRecomendados.length > 0) {
      const generosStr = extraido.valores.join(' e ');
      // Limita o número de livros se solicitado
      if (numeroSolicitado && numeroSolicitado < livrosRecomendados.length) {
        livrosRecomendados = livrosRecomendados.slice(0, numeroSolicitado);
        resposta = `Aqui estão ${numeroSolicitado} livros dos gêneros "${generosStr}":\n` + livrosRecomendados.map(l => `• ${l.titulo} (${l.autor}) - ${l.genero}`).join('\n');
      } else {
        resposta = `Aqui estão livros dos gêneros "${generosStr}":\n` + livrosRecomendados.map(l => `• ${l.titulo} (${l.autor}) - ${l.genero}`).join('\n');
      }
    } else {
      // Se não encontrou por gênero, tenta buscar por tags
      livrosRecomendados = livros.filter(l => 
        extraido.valores.some(genero => l.tags.some(t => t.toLowerCase().includes(genero)))
      );
      if (livrosRecomendados.length > 0) {
        const generosStr = extraido.valores.join(' e ');
        if (numeroSolicitado && numeroSolicitado < livrosRecomendados.length) {
          livrosRecomendados = livrosRecomendados.slice(0, numeroSolicitado);
          resposta = `Não encontrei livros dos gêneros "${generosStr}", mas aqui estão ${numeroSolicitado} livros com essas tags:\n` + livrosRecomendados.map(l => `• ${l.titulo} (${l.autor})`).join('\n');
        } else {
          resposta = `Não encontrei livros dos gêneros "${generosStr}", mas aqui estão livros com essas tags:\n` + livrosRecomendados.map(l => `• ${l.titulo} (${l.autor})`).join('\n');
        }
      } else {
        const generosStr = extraido.valores.join(' e ');
        resposta = `Não encontrei livros dos gêneros "${generosStr}". Quer tentar outros gêneros?`;
      }
    }
  } else if (extraido?.tipo === 'tags') {
    // Busca livros que correspondam a qualquer uma das tags mencionadas
    livrosRecomendados = livros.filter(l => 
      extraido.valores.some(tag => l.tags.some(t => t.toLowerCase().includes(tag)))
    );
    const tagsStr = extraido.valores.join(' e ');
    if (numeroSolicitado && numeroSolicitado < livrosRecomendados.length) {
      livrosRecomendados = livrosRecomendados.slice(0, numeroSolicitado);
      resposta = livrosRecomendados.length > 0
        ? `Aqui estão ${numeroSolicitado} livros com as tags "${tagsStr}":\n` + livrosRecomendados.map(l => `• ${l.titulo} (${l.autor})`).join('\n')
        : `Não encontrei livros com as tags "${tagsStr}". Quer tentar outras palavras-chave?`;
    } else {
      resposta = livrosRecomendados.length > 0
        ? `Aqui estão livros com as tags "${tagsStr}":\n` + livrosRecomendados.map(l => `• ${l.titulo} (${l.autor})`).join('\n')
        : `Não encontrei livros com as tags "${tagsStr}". Quer tentar outras palavras-chave?`;
    }
  } else if (respostaNLP.intent === 'recomendar.genero' && respostaNLP.entities.length > 0) {
    const genero = respostaNLP.entities.find(e => e.entity === 'genero')?.option || respostaNLP.entities[0].sourceText;
    livrosRecomendados = livros.filter(l => l.genero.toLowerCase().includes(genero.toLowerCase()));
    
    // Se não encontrou por gênero, tenta buscar por tags
    if (livrosRecomendados.length === 0) {
      livrosRecomendados = livros.filter(l => l.tags.some(t => t.toLowerCase().includes(genero.toLowerCase())));
      if (livrosRecomendados.length > 0) {
        if (numeroSolicitado && numeroSolicitado < livrosRecomendados.length) {
          livrosRecomendados = livrosRecomendados.slice(0, numeroSolicitado);
          resposta = `Não encontrei livros do gênero "${genero}", mas aqui estão ${numeroSolicitado} livros com a tag "${genero}":\n` + livrosRecomendados.map(l => `• ${l.titulo} (${l.autor})`).join('\n');
        } else {
          resposta = `Não encontrei livros do gênero "${genero}", mas aqui estão livros com a tag "${genero}":\n` + livrosRecomendados.map(l => `• ${l.titulo} (${l.autor})`).join('\n');
        }
      } else {
        resposta = `Não encontrei livros do gênero "${genero}". Quer tentar outro gênero?`;
      }
    } else {
      if (numeroSolicitado && numeroSolicitado < livrosRecomendados.length) {
        livrosRecomendados = livrosRecomendados.slice(0, numeroSolicitado);
        resposta = `Aqui estão ${numeroSolicitado} livros do gênero "${genero}":\n` + livrosRecomendados.map(l => `• ${l.titulo} (${l.autor})`).join('\n');
      } else {
        resposta = `Aqui estão livros do gênero "${genero}":\n` + livrosRecomendados.map(l => `• ${l.titulo} (${l.autor})`).join('\n');
      }
    }
  } else if (respostaNLP.intent === 'recomendar.tag' && respostaNLP.entities.length > 0) {
    const tag = respostaNLP.entities.find(e => e.entity === 'tag')?.option || respostaNLP.entities[0].sourceText;
    livrosRecomendados = livros.filter(l => l.tags.some(t => t.toLowerCase().includes(tag.toLowerCase())));
    if (numeroSolicitado && numeroSolicitado < livrosRecomendados.length) {
      livrosRecomendados = livrosRecomendados.slice(0, numeroSolicitado);
      resposta = livrosRecomendados.length > 0
        ? `Aqui estão ${numeroSolicitado} livros com a tag "${tag}":\n` + livrosRecomendados.map(l => `• ${l.titulo} (${l.autor})`).join('\n')
        : `Não encontrei livros com a tag "${tag}". Quer tentar outra palavra-chave?`;
    } else {
      resposta = livrosRecomendados.length > 0
        ? `Aqui estão livros com a tag "${tag}":\n` + livrosRecomendados.map(l => `• ${l.titulo} (${l.autor})`).join('\n')
        : `Não encontrei livros com a tag "${tag}". Quer tentar outra palavra-chave?`;
    }
  } else if (respostaNLP.intent === 'recomendar.similar' && respostaNLP.entities.length > 0) {
    const titulo = respostaNLP.entities.find(e => e.entity === 'titulo')?.option || respostaNLP.entities[0].sourceText;
    const livroBase = livros.find(l => l.titulo.toLowerCase().includes(titulo.toLowerCase()));
    if (livroBase) {
      livrosRecomendados = livros.filter(l => l.titulo !== livroBase.titulo && (l.genero === livroBase.genero || l.tags.some(tag => livroBase.tags.includes(tag))));
      if (numeroSolicitado && numeroSolicitado < livrosRecomendados.length) {
        livrosRecomendados = livrosRecomendados.slice(0, numeroSolicitado);
        resposta = livrosRecomendados.length > 0
          ? `Se você gostou de "${livroBase.titulo}", talvez goste destes ${numeroSolicitado}:\n` + livrosRecomendados.map(l => `• ${l.titulo} (${l.autor})`).join('\n')
          : `Não encontrei livros parecidos com "${livroBase.titulo}". Quer tentar outro título?`;
      } else {
        resposta = livrosRecomendados.length > 0
          ? `Se você gostou de "${livroBase.titulo}", talvez goste destes:\n` + livrosRecomendados.map(l => `• ${l.titulo} (${l.autor})`).join('\n')
          : `Não encontrei livros parecidos com "${livroBase.titulo}". Quer tentar outro título?`;
      }
    } else {
      resposta = `Não encontrei o livro "${titulo}". Pode informar outro título ou tentar por gênero?`;
    }
  } else {
    resposta = 'Desculpe, não entendi seu pedido. Você pode pedir, por exemplo: "Me recomende um livro de aventura" ou "Quero algo parecido com 1984".';
  }

  return {
    resposta,
    contexto: {} // Contexto pode ser expandido para conversas futuras
  };
}

module.exports = { processarMensagem };