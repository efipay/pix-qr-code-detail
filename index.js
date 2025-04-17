/* ---------- tabelas tiradas do Manual do BR Code --------- */
const ROOT_NAMES = {
    '00': 'Payload Format Indicator',
    '01': 'Point of Initiation Method',
    // 26‑51 → template, tratado adiante
    '52': 'Merchant Category Code',
    '53': 'Transaction Currency',
    '54': 'Transaction Amount',
    '58': 'Country Code',
    '59': 'Merchant Name',
    '60': 'Merchant City',
    '61': 'Postal Code',
    '62': 'Additional Data Field Template',
    '63': 'CRC‑16'
};

const MAI_NAMES = {                     // dentro de 26‑51
    '00': 'Globally Unique Identifier',
    '01': 'Chave Pix',
    '02': 'Informações Adicionais',
    '25': 'URL do Payload'
};

const ADD_DATA_NAMES = {                // dentro de 62
    '05': 'Reference Label'
};

function getTagName(tag, parent = null) {
    if (!parent) {                        // nível raiz
        if (Number(tag) >= 26 && Number(tag) <= 51)
            return 'Merchant Account Information';
        return ROOT_NAMES[tag];
    }

    if (Number(parent) >= 26 && Number(parent) <= 51)
        return MAI_NAMES[tag];

    if (parent === '62')
        return ADD_DATA_NAMES[tag];

    return undefined;                     // não definido na especificação
}

const axios = require('axios');
const jwt = require('jsonwebtoken');

/* ----------------------------------------------------------- */
/* ------------------------- TLV helpers --------------------- */

function parseTLV(data, start = 0, end = data.length, parent = null) {
    const out = [];
    let i = start;

    while (i + 4 <= end) {
        const tag = data.slice(i, i + 2);
        const length = Number(data.slice(i + 2, i + 4));
        const value = data.slice(i + 4, i + 4 + length);

        const element = {
            tag,
            length,
            value,
            tagName: getTagName(tag, parent)
        };

        /* ---- só 26‑51, 62 ou 64 são templates; “00” não é ----- */
        const tagNum = Number(tag);
        const isNested =
            (tagNum >= 26 && tagNum <= 51) || tag === '62' || tag === '64';

        if (isNested)
            element.children = parseTLV(value, 0, value.length, tag);

        out.push(element);
        i += 4 + length;
    }
    return out;
}

function extractPixUrl(brcode) {
    const tlvs = parseTLV(brcode);

    const mai = tlvs.find(tl => {
        const n = Number(tl.tag);
        return n >= 26 && n <= 51;          // Merchant Account Information
    });
    if (!mai || !mai.children) return undefined;

    const urlField = mai.children.find(c => c.tag === '25'); // sub‑tag 25
    return urlField ? urlField.value : undefined;
}

/* ------------------------------------------------------------------------ */

// ---------- Exemplo de uso ----------
const sample =
    '00020101021226830014BR.GOV.BCB.PIX2561qrcodespix.sejaefi.com.br/v2/ff719c748dc244a294adee9174ace3795204000053039865802BR5905EFISA6008SAOPAULO62070503***6304BAC4';

// console.log(extractPixUrl(sample));


// // → qrcodespix.sejaefi.com.br/v2/ff719c748dc244a294adee9174ace379

// // Se quiser ver tudo decodificado:
console.dir(parseTLV(sample), { depth: null });
console.log('\n\n');

/* ----------------------------------------------------------- */
/* ------------- download e decodificação do JWT ------------- */

async function getDecodedPixJwt(brcode) {
    const raw = extractPixUrl(brcode);
    if (!raw) throw new Error('URL do payload não encontrada no BR Code.');

    const url = raw.startsWith('http') ? raw : `https://${raw}`;

    const { data: token } = await axios.get(url, {
        responseType: 'text',
        headers: { Accept: 'application/jwt, text/plain' },
        timeout: 5_000,
        validateStatus: s => s >= 200 && s < 300,
    });

    const complete = jwt.decode(token, { complete: true });
    if (!complete) throw new Error('Token JWT inesperado ou malformado.');

    const { header, payload, signature } = complete;
    return { header, payload, signature };
}


module.exports = {
    parseTLV,
    extractPixUrl,
    getDecodedPixJwt,
};

//  ---------------------- Exemplo de uso -----------------------

// const sample = '00020101021226830014BR.GOV.BCB.PIX2561qrcodespix.sejaefi.com.br/v2/ff719c748dc244a294adee9174ace3795204000053039865802BR5905EFISA6008SAOPAULO62070503***6304BAC4';


(async () => {
    try {
        const jwtDecoded = await getDecodedPixJwt(sample);
        // console.log('Header :', jwtDecoded.header);
        console.log('Payload:', jwtDecoded.payload);
    } catch (err) {
        console.error(err);
    }
})();
