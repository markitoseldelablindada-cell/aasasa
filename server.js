const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// PON TU COOKIE DIRECTAMENTE AQUÍ
const ROBLOSECURITY = "_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|_CAEaAhAB.6C6A8324362ACF599ABC018B12536EE3A8B8772F9F412115D8CC8DAA978A69F4213B0CB96906B19A9E0E777246B78C66C137B6BA8AD55E5134670E546848B10166BE72812361DE011F0B5E17F09B0EAA525DAABDF31589DB7A8F01B74C31DA0EBC1057AE08AD2F4B7A12EAD4A0DF2876CFB02DE45EF0251E3838CD89EF1292B079644D5E608733BB32209324CCBE91A2C1C26FB46120598B4D190C52C1570FD0E9868C9C61A4E90DC0681D0C1759CAB3B7632DE9A2B590D3EE694B43C0297EBCFA3DDAE18E7876C37756C50C680B8A6909AA5B9D9591B6EDC2A12C6D46D88C3E819374CF599EFAED76817BF22AE70142E79581F1EC0E1FA307BA830AA8570A86738749F4FAF9AE9D789827446C0C22CBF2173F5B5B20F74626D822548C69D85BBCA618EC00483A4EB78D408B9028C9529561C411D4A76DDE042FCF08BC2D3D026F17499E9142745946136E3DFB1B38AECC7B5E5B0CB4E2232CD70C9F25B35E318A58E950A56CCB9B0FC8E424FDDC6AC61B75D2B8C4C2C8284B82D4BE31EBD3E796F62E4705F70AA3C4AF04035F668F3462565D172C4F6FC6105B48AD84318A66630BC717C63A2F0CB224CAC20802D159FC74E77E8236CE28BB27999F331C7A1E1D2CD2F082FF660522ABEB542837F7646B70B8B319FB7C04F98952A18DA8890AF3A04D41181C25573E4F63686883EE0B2300F1CB2953D790CDD19B640064CFB8F57D82CF023B3B39986A76B0AC75437928AEDE07A029311599F308065D8EF0601EF4A80024CF033523CDDFCC2BE927E81DBEA3E822F3787A386712ADCF201B41F79F86817AA993BE836B85A7854279FF60A25A3F1D21C22E2E93470F3732361A1989CF21CBAFD9A383B7FD1DA5DDAF971F853D1E946D67D37107A6994CFE96BACBE0EE4D2C58FB5ED4BAA68B6997D488D32267EFA91ED434899E42E4D4833CF38AD529B88E53CDA0A076B00DC3328B21802BE53610AF1CF9CC3AEAD80F7543B22F6255BEAAE0783C9D7DD520FC8D0C1758F972FB9D04E506F4D279A2F742C01C65311703E1E1ACADB4BE09639DF952430525912EB2E2E31837FCB946C366C11C82575D8AA6E5CE6373FBC8551D5E03F9799C47F4DD2F35E2FEBC11404A3C6FFCC8A8AAC36BB8F3AB0CB6DABC300116C63FA39FA10D90FF496A7979970521586DEDBE235B672E24A4E9836B731583580F55F41A123829E32FBB0BB1853CD10B765913C1AA336DBEB1D6D41FA73BA7A1559BF7A89D";

if (!ROBLOSECURITY) {
    console.error("Debes poner tu ROBLOSECURITY en el código.");
    process.exit(1);
}

// Importar fetch correctamente en Node.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Headers optimizados para velocidad
const ROBLOX_HEADERS = {
    'Cookie': `.ROBLOSECURITY=${ROBLOSECURITY}`,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'X-CSRF-TOKEN': 'undefined', // Algunas APIs de Roblox lo requieren
    'Referer': 'https://www.roblox.com/',
};

// Cache simple para evitar solicitudes repetidas en corto tiempo
const requestCache = new Map();
const CACHE_TTL = 5000; // 5 segundos de cache

// Función ultra-rápida con fallback inteligente
async function getUserStats(userId) {
    const cacheKey = `stats_${userId}`;
    const cached = requestCache.get(cacheKey);
    
    // Devolver datos cacheados si están frescos
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        console.log(`✅ Devolviendo datos cacheados para ${userId}`);
        return cached.data;
    }

    try {
        console.log(`⚡ Obteniendo estadísticas en tiempo real para: ${userId}`);
        
        // Hacer todas las solicitudes simultáneamente para máxima velocidad
        const [friendsRes, followersRes, followingRes] = await Promise.allSettled([
            fetch(`https://friends.roblox.com/v1/users/${userId}/friends/count`, { 
                headers: ROBLOX_HEADERS,
                timeout: 3000 
            }),
            fetch(`https://friends.roblox.com/v1/users/${userId}/followers/count`, { 
                headers: ROBLOX_HEADERS,
                timeout: 3000 
            }),
            fetch(`https://friends.roblox.com/v1/users/${userId}/followings/count`, { 
                headers: ROBLOX_HEADERS,
                timeout: 3000 
            })
        ]);

        // Procesar respuestas con fallback a 0 si fallan
        const processResponse = (result, defaultValue = 0) => {
            if (result.status === 'fulfilled' && result.value.ok) {
                return result.value.json().then(data => data.count || defaultValue);
            }
            return defaultValue;
        };

        const [amigos, seguidores, seguidos] = await Promise.all([
            processResponse(friendsRes),
            processResponse(followersRes),
            processResponse(followingRes)
        ]);

        const stats = {
            Amigos: amigos,
            Seguidores: seguidores,
            Seguidos: seguidos,
            Timestamp: new Date().toISOString(),
            Status: 'live'
        };

        // Guardar en cache
        requestCache.set(cacheKey, {
            data: stats,
            timestamp: Date.now()
        });

        console.log(`✅ Datos obtenidos instantáneamente para ${userId}`);
        return stats;

    } catch (error) {
        console.error(`❌ Error crítico para ${userId}:`, error.message);
        
        // Devolver datos de cache aunque estén viejos como fallback
        if (cached) {
            console.log(`🔄 Usando datos cacheados como fallback para ${userId}`);
            return { ...cached.data, Status: 'cached_fallback' };
        }

        return { 
            Amigos: 0, 
            Seguidores: 0, 
            Seguidos: 0,
            Timestamp: new Date().toISOString(),
            Status: 'error',
            Error: "No se pudieron obtener los datos"
        };
    }
}

// Middleware para logging rápido
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        console.log(`🚀 ${req.method} ${req.path} - ${Date.now() - start}ms`);
    });
    next();
});

// Endpoint ultra rápido
app.get('/stats/:userId', async (req, res) => {
    const userId = req.params.userId;
    
    // Validación rápida
    if (!/^\d+$/.test(userId)) {
        return res.status(400).json({ 
            error: "ID de usuario inválido",
            Status: 'error'
        });
    }

    try {
        const stats = await getUserStats(userId);
        res.json(stats);
    } catch (error) {
        console.error("Error en endpoint:", error);
        res.status(500).json({ 
            Amigos: 0, 
            Seguidores: 0, 
            Seguidos: 0,
            Status: 'error',
            Error: error.message
        });
    }
});

// Health check rápido
app.get('/', (req, res) => {
    res.json({ 
        status: 'online',
        message: 'Roblox Proxy Server - Ultra Fast Mode',
        timestamp: new Date().toISOString()
    });
});

// Limpiar cache periódicamente
setInterval(() => {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, value] of requestCache.entries()) {
        if (now - value.timestamp > CACHE_TTL * 2) {
            requestCache.delete(key);
            cleaned++;
        }
    }
    
    if (cleaned > 0) {
        console.log(`🧹 Limpiados ${cleaned} items del cache`);
    }
}, 30000); // Cada 30 segundos

// Iniciar servidor
app.listen(port, () => {
    console.log(`⚡ Proxy ULTRA-RÁPIDO corriendo en puerto ${port}`);
    console.log(`📊 Endpoint: http://localhost:${port}/stats/{userId}`);
    console.log(`⏱️  Modo: Instantáneo (0 delays)`);
});
