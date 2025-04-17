# pix-qr-code-detail

![Node.js](https://img.shields.io/badge/Node-%3E%3D14.17-brightgreen)

Pacote Node.js minimalista que realiza **todo o fluxo de inspeção de um BR Code do PIX**:

1. Faz o parsing TLV do código QR/BR Code;
2. Localiza a _Merchant Account Information_ (tags 26–51) e extrai a **URL do payload**;
3. Baixa o payload via HTTP/HTTPS;
4. Decodifica o **JWT** e devolve `{ header, payload, signature }`.

Ideal para validação, auditoria ou integração de sistemas de pagamento que precisem inspecionar rapidamente BR Codes sem depender de bibliotecas pesadas.

---

O repositório no [GitHub](https://github.com/efipay/pix-qr-code-detail) inclui exemplos prontos em JavaScript (.js) e TypeScript (.ts). O mesmo código está publicado no [NPM](https://www.npmjs.com/package/pix-qr-code-detail) e pode ser usado em projetos CommonJS (require) ou ES Modules (import) — o funcionamento é idêntico em ambos os casos.

---

## Instalação

```bash
npm i pix-qr-code-detail
```

O pacote publica CJS e ESM automaticamente, basta usar:

```js
// CommonJS
const { getDecodedPixJwt } = require("pix-qr-code-detail");

// ESM / TypeScript
import { getDecodedPixJwt } from "pix-qr-code-detail";
```

Além da função `getDecodedPixJwt` são exportadas também `parseTLV` e `extractPixUrl`

**`parseTLV`**: Converte a string do BR Code em um array de objetos TLV. Cada item traz: tag, length, value, tagName (nome oficial segundo o manual do BR Code) e, quando aplicável, children com TLVs aninhados.

**`extractPixUrl`**: Varre o BR Code e devolve apenas o valor da sub‑tag 25 (URL do Payload) dentro do Merchant Account Information (tags 26‑51). Se não existir, devolve undefined.

**`getDecodedPixJwt`**: Usa extractPixUrl para obter a URL, baixa o token JWT (GET + Accept: application/jwt) e devolve o header, o payload e a signature já decodificados via jsonwebtoken.decode() (opção { complete: true }).

## Exemplo
```js
import { parseTLV, extractPixUrl, getDecodedPixJwt } from 'pix-qr-code-detail';

const brcode = '00020101021226830014BR.GOV.BCB.PIX2561qrcodespix.sejaefi.com.br/v2/ff719c748dc244a294adee9174ace3795204000053039865802BR5905EFISA6008SAOPAULO62070503***6304BAC4';

// 1. Listar campos do QR‑Code
console.dir(parseTLV(brcode), { depth: null });

// 2. Pegar só a URL do payload
console.log('URL:', extractPixUrl(brcode));

// 3. Baixar e decodificar o JWT Pix
(async () => {
  const { payload } = await getDecodedPixJwt(brcode);
  console.log('Payload JWT:', payload);
})();

```