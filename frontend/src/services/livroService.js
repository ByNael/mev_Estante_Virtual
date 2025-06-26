const API_URL = 'http://localhost:5000/api';

export const livroService = {
    async atualizarStatusLivro(livroId, novoStatus) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/livros/${livroId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ novoStatus }),
            });

            if (!response.ok) {
                throw new Error('Erro ao atualizar status do livro');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro no serviço:', error);
            throw error;
        }
    }
}; 