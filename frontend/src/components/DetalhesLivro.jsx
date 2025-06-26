import React from 'react';
import StatusLivro from './StatusLivro';

const DetalhesLivro = ({ livro, onLivroAtualizado }) => {
    const handleStatusChange = (livroAtualizado) => {
        onLivroAtualizado(livroAtualizado);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            {livro.capa ? (
                <div className="mb-4 flex justify-center">
                    <img src={`http://localhost:5000${livro.capa}`} alt={`Capa de ${livro.titulo}`} className="h-40 object-cover rounded" />
                </div>
            ) : (
                <div className="mb-4 flex justify-center">
                    <div className="h-40 w-32 bg-gray-200 flex items-center justify-center rounded">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <rect x="3" y="4" width="18" height="16" rx="2" ry="2" stroke="currentColor" fill="none" />
                            <circle cx="8.5" cy="9.5" r="1.5" />
                            <path d="M21 15l-5-5L5 21" />
                        </svg>
                    </div>
                </div>
            )}
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