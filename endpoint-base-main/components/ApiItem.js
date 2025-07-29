import React, { useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

const ApiItem = ({ api, onTest }) => {
  const [testUrl, setTestUrl] = useState('');
  const [body, setBody] = useState('{\n  "key": "value"\n}');
  const { path, method, name, params } = api;
  const { loading, data, type } = onTest.state[path] || {};

  const methodColors = {
    GET: '#22c55e', POST: '#3b82f6', PUT: '#f97316',
    DELETE: '#ef4444', PATCH: '#a855f7', DEFAULT: '#facc15'
  };

  const hasBody = ['POST', 'PUT', 'PATCH'].includes(method);

  const handleTestClick = () => {
    onTest.execute(path, testUrl, method, hasBody ? body : null);
  };
  
  const copyToClipboard = () => {
    if (data && type !== 'image') {
      navigator.clipboard.writeText(data);
      onTest.showToast('Disalin ke clipboard!', 'success');
    }
  };

  const buttonStyle = {
    background: '#3b82f6', color: '#fff', border: 'none',
    padding: '0.5rem 1rem', borderRadius: '6px',
    cursor: loading ? 'not-allowed' : 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
    transition: 'background-color 0.2s', opacity: loading ? 0.7 : 1,
  };

  return (
    <li style={{
      background: '#1e293b', padding: '1.25rem', borderRadius: '8px',
      borderLeft: `4px solid ${methodColors[method] || methodColors.DEFAULT}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)', marginBottom: '1rem',
    }}>
        <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ 
                    backgroundColor: methodColors[method] || methodColors.DEFAULT, 
                    color: 'white', fontSize: '0.75rem', fontWeight: 'bold',
                    padding: '0.25rem 0.75rem', borderRadius: '9999px', flexShrink: 0
                }}>{method}</span>
                <code style={{ color: '#cbd5e1', fontFamily: "'JetBrains Mono', monospace", fontSize: '1.125rem' }}>{path}</code>
                <span style={{
                    marginLeft: '0.5rem', background: '#15803d', color: '#f0fdf4',
                    fontSize: '0.7rem', fontWeight: 'bold', padding: '0.15rem 0.6rem',
                    borderRadius: '9999px', display: 'flex', alignItems: 'center',
                    gap: '0.25rem', textTransform: 'uppercase'
                }}>✓ Ready</span>
            </div>
            <small style={{ color: '#64748b', marginLeft: 'calc(1rem + 60px)' }}>{name}</small>
        </div>

        <div style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
            <strong style={{ color: '#94a3b8' }}>🔧 Parameters:</strong> 
            <code style={{ marginLeft: '0.5rem', color: '#f472b6', fontFamily: "'JetBrains Mono', monospace" }}>{params || 'Tidak ada'}</code>
        </div>
      
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    placeholder="Path & Query Params (Contoh: /1?user=admin)"
                    value={testUrl}
                    onChange={e => setTestUrl(e.target.value)}
                    style={{
                        flex: '1 1 auto', minWidth: '200px', background: '#0f172a',
                        border: '1px solid #475569', borderRadius: '6px',
                        padding: '0.5rem', color: 'white', fontFamily: "'JetBrains Mono', monospace"
                    }}
                />
                <button onClick={handleTestClick} disabled={loading} style={buttonStyle}>
                    {loading ? <span className="spinner"></span> : '🚀 Kirim'}
                </button>
            </div>
            {hasBody && (
            <textarea
                value={body} onChange={e => setBody(e.target.value)}
                rows={5} placeholder="Request Body (JSON)"
                style={{
                    background: '#0f172a', border: '1px solid #475569',
                    borderRadius: '6px', padding: '0.75rem', width: '100%',
                    color: 'white', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem'
                }}
            />
            )}
        </div>

        {data && (
            <div style={{
                marginTop: '1rem', backgroundColor: 'rgba(0,0,0,0.5)',
                borderRadius: '8px', border: '1px solid #334155', position: 'relative'
            }}>
                {type !== 'image' && (
                <button onClick={copyToClipboard} title="Salin Respons" style={{
                    position: 'absolute', top: '10px', right: '10px', background: '#475569',
                    color: 'white', border: 'none', borderRadius: '4px',
                    padding: '0.25rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer', zIndex: 10
                }}>📋 Copy</button>
                )}
                {type === 'error' && <pre style={{ padding: '1rem', color: '#f87171', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>{data}</pre>}
                {type === 'text' && <pre style={{ padding: '1rem', color: '#d1d5db', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>{data}</pre>}
                {type === 'json' && (
                <SyntaxHighlighter language="json" style={atomOneDark} customStyle={{ background: 'transparent', padding: '1rem', fontFamily: "'JetBrains Mono', monospace" }}>
                    {data}
                </SyntaxHighlighter>
                )}
                {type === 'image' && (
                <div style={{ padding: '1rem', display: 'flex', justifyContent: 'center' }}>
                    <img src={data} alt="API Response" style={{ maxWidth: '100%', height: 'auto', borderRadius: '6px' }} />
                </div>
                )}
            </div>
        )}
    </li>
  );
};

export default ApiItem;
