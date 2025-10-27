const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL || 'http://localhost:5111/api/v1';




async function apiFetch(path: string, options: RequestInit = {}) {
    const { currentSession } = await import('@/lib/session');
    const session = await currentSession();


    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (session?.accessToken) {
        headers['Authorization'] = `Bearer ${session.accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            ...headers,
            ...options.headers,
        },
        next: { revalidate: 60, ...options.next },
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: response.statusText }));
        const errorMessage = errorBody.detail || errorBody.title || errorBody.message || `API Error: ${response.status}`;
        console.error(`API Fetch Error on path ${path}:`, errorMessage);
        throw new Error(errorMessage);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

export const apiClient = {
    get: <TResponse>(path: string): Promise<TResponse> => apiFetch(path, { method: 'GET' }),
    
    post: <TBody, TResponse>(path: string, body: TBody): Promise<TResponse> => 
        apiFetch(path, { method: 'POST', body: JSON.stringify(body) }),

    patch: <TBody, TResponse>(path: string, body: TBody): Promise<TResponse> => 
        apiFetch(path, { method: 'PATCH', body: JSON.stringify(body) }),

    put: <TBody, TResponse>(path: string, body: TBody): Promise<TResponse> => 
        apiFetch(path, { method: 'PUT', body: JSON.stringify(body) }),
        
    delete: <TResponse>(path: string): Promise<TResponse | null> => 
        apiFetch(path, { method: 'DELETE' }),
};