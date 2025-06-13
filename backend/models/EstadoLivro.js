class EstadoLivro {
    atualizar(livro) {
        throw new Error('Método atualizar deve ser implementado');
    }
}

class EstadoNaoIniciado extends EstadoLivro {
    atualizar(livro) {
        livro.status = 'nao_iniciado';
        livro.dataAtualizacao = new Date();
    }
}

class EstadoEmLeitura extends EstadoLivro {
    atualizar(livro) {
        livro.status = 'em_leitura';
        livro.dataAtualizacao = new Date();
    }
}

class EstadoConcluido extends EstadoLivro {
    atualizar(livro) {
        livro.status = 'concluido';
        livro.dataAtualizacao = new Date();
    }
}

module.exports = {
    EstadoLivro,
    EstadoNaoIniciado,
    EstadoEmLeitura,
    EstadoConcluido
}; 