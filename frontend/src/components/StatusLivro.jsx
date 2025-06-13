import React, { useState } from 'react';
import { livroService } from '../services/livroService';

const StatusLivro = ({ livro, onStatusChange }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleStatusChange = async (novoStatus) => {
        try {
            setLoading(true);
            setError(null);
            const livroAtualizado = await livroService.atualizarStatusLivro(livro._id, novoStatus);
            onStatusChange(livroAtualizado);
        } catch (err) {
            setError('Erro ao atualizar status do livro');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'nao_iniciado':
                return 'bg-gray-200';
            case 'em_leitura':
                return 'bg-blue-200';
            case 'concluido':
                return 'bg-green-200';
            default:
                return 'bg-gray-200';
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(livro.status)}`}>
                    {livro.status === 'nao_iniciado' && 'Não Iniciado'}
                    {livro.status === 'em_leitura' && 'Em Leitura'}
                    {livro.status === 'concluido' && 'Concluído'}
                </span>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => handleStatusChange('em_leitura')}
                    disabled={loading || livro.status === 'em_leitura'}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    {loading ? 'Atualizando...' : 'Começar a Ler'}
                </button>
                <button
                    onClick={() => handleStatusChange('concluido')}
                    disabled={loading || livro.status === 'concluido'}
                    className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                >
                    {loading ? 'Atualizando...' : 'Marcar como Concluído'}
                </button>
            </div>

            {error && (
                <p className="text-red-500 text-sm">{error}</p>
            )}
        </div>
    );
};

export default StatusLivro; 