import React, { useState } from 'react';
import { GithubIcon, TelegramIcon, WhatsappIcon } from './Icons';

const Footer = () => {
    const [hovered, setHovered] = useState(null);

    const socialLinks = {
        github: 'https://github.com/username', // GANTI DENGAN LINK ANDA
        telegram: 'https://t.me/username', // GANTI DENGAN LINK ANDA
        whatsapp: 'https://whatsapp.com/channel/0029Vb6P2e1E50UZYaX4wI0W' // GANTI DENGAN LINK ANDA
    };
    
    const iconStyle = {
        fill: '#94a3b8', // slate-400
        transition: 'fill 0.2s ease-in-out'
    };
    
    const hoveredIconStyle = {
        fill: '#38bdf8', // sky-400
    };

    return (
        <footer style={{ textAlign: 'center', marginTop: '4rem', padding: '2rem 0', borderTop: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
                <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" onMouseEnter={() => setHovered('github')} onMouseLeave={() => setHovered(null)}>
                    <GithubIcon style={{ ...iconStyle, ...(hovered === 'github' && hoveredIconStyle) }} />
                </a>
                <a href={socialLinks.telegram} target="_blank" rel="noopener noreferrer" onMouseEnter={() => setHovered('telegram')} onMouseLeave={() => setHovered(null)}>
                    <TelegramIcon style={{ ...iconStyle, ...(hovered === 'telegram' && hoveredIconStyle) }} />
                </a>
                <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" onMouseEnter={() => setHovered('whatsapp')} onMouseLeave={() => setHovered(null)}>
                    <WhatsappIcon style={{ ...iconStyle, ...(hovered === 'whatsapp' && hoveredIconStyle) }} />
                </a>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                Credit by <span style={{ fontWeight: 'bold', color: '#e2e8f0' }}>Zypher</span>
            </p>
        </footer>
    );
};

export default Footer;
