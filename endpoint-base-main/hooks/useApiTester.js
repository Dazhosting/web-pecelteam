import { useState, useCallback, useEffect } from 'react';

export default function useApiTester() {
  const [apiState, setApiState] = useState({});
  const [toast, setToast] = useState({ message: '', type: 'info', visible: false });

  // Efek untuk membersihkan Object URL dari response gambar
  useEffect(() => {
    return () => {
      Object.values(apiState).forEach(state => {
        if (state.type === 'image' && state.data) {
          URL.revokeObjectURL(state.data);
        }
      });
    };
  }, [apiState]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(t => ({...t, visible: false }));
    }, 3000);
  };

  const handleTestApi = useCallback(async (apiPath, testParams, method, body) => {
    const fullUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}${apiPath}${testParams}`;
    
    if (apiState[apiPath]?.type === 'image') {
        URL.revokeObjectURL(apiState[apiPath].data);
    }

    setApiState(prev => ({ ...prev, [apiPath]: { loading: true, data: null, type: null } }));

    const options = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) {
      try {
        options.body = JSON.stringify(JSON.parse(body));
      } catch (e) {
        const errorMsg = 'Request body bukan format JSON yang valid.';
        setApiState(prev => ({ ...prev, [apiPath]: { loading: false, data: `❌ Error: ${errorMsg}`, type: 'error' } }));
        showToast(errorMsg, 'error');
        return;
      }
    }

    try {
      const res = await fetch(fullUrl, options);
      const contentType = res.headers.get('content-type');
      let responseData;
      let responseType;

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Status ${res.status} - ${errorText}`);
      }

      if (contentType && contentType.includes('application/json')) {
        responseData = JSON.stringify(await res.json(), null, 2);
        responseType = 'json';
      } else if (contentType && contentType.startsWith('image/')) {
        const blob = await res.blob();
        responseData = URL.createObjectURL(blob);
        responseType = 'image';
      } else {
        responseData = await res.text();
        responseType = 'text';
      }
      
      setApiState(prev => ({ ...prev, [apiPath]: { loading: false, data: responseData, type: responseType } }));
      showToast('Request berhasil dieksekusi!', 'success');

    } catch (err) {
      const errorMsg = `Gagal fetch: ${err.message}`;
      setApiState(prev => ({ ...prev, [apiPath]: { loading: false, data: `❌ ${errorMsg}`, type: 'error' } }));
      showToast(errorMsg, 'error');
    }
  }, [apiState]);

  return { apiState, toast, showToast, handleTestApi };
}
