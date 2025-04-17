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
const { getDecodedPixJwt } = require('pix-qr-code-detail');

// ESM / TypeScript
import { getDecodedPixJwt } from 'pix-qr-code-detail';
```
