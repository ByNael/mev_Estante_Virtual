import React from 'react';
import StatusLivro from './StatusLivro';

const DetalhesLivro = ({ livro, onLivroAtualizado }) => {
    const handleStatusChange = (livroAtualizado) => {
        onLivroAtualizado(livroAtualizado);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">{livro.titulo}</h2>
            <p className="text-gray-600 mb-2">Autor: {livro.autor}</p>
            
            <div className="mt-4">
                <StatusLivro 
                    livro={livro} 
                    onStatusChange={handleStatusChange}
                />
            </div>

            {/* Outros detalhes do livro */}
            <div className="mt-4 text-sm text-gray-500">
                Última atualização: {new Date(livro.dataAtualizacao).toLocaleDateString()}
            </div>
        </div>
    );
};

export default DetalhesLivro; 