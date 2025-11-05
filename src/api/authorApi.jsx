import axiosClient from './axiosClient';

const authorApi = {
    // Public APIs
    getAuthorDetail: (authorId) => {
        const url = `/authors/public/${authorId}`;
        return axiosClient.get(url);
    },

    getAuthorBooks: (authorId) => {
        const url = `/authors/public/${authorId}/books`;
        return axiosClient.get(url);
    },

    searchAuthors: (query, limit = 20) => {
        const url = '/authors/public/search';
        return axiosClient.get(url, { params: { q: query, limit } });
    },

    getPopularAuthors: (limit = 10) => {
        const url = '/authors/public/popular';
        return axiosClient.get(url, { params: { limit } });
    },

    // Admin APIs
    getAllAuthors: () => {
        const url = '/authors';
        return axiosClient.get(url);
    },

    getAuthorById: (authorId) => {
        const url = `/authors/${authorId}`;
        return axiosClient.get(url);
    },

    createAuthor: (data) => {
        const url = '/authors';
        return axiosClient.post(url, data);
    },

    updateAuthor: (authorId, data) => {
        const url = `/authors/${authorId}`;
        return axiosClient.patch(url, data);
    },

    deleteAuthor: (authorId) => {
        const url = `/authors/${authorId}`;
        return axiosClient.delete(url);
    },

    searchAuthorsAdmin: (authorName) => {
        const url = `/authors/name/${encodeURIComponent(authorName)}`;
        return axiosClient.get(url);
    },

    me: () => {
        const url = '/auth/me';
        return axiosClient.get(url);
    },
};

export default authorApi;
