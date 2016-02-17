///<reference path="./project.d.ts"/>
"use strict";

import { createCipheriv, createDecipheriv, randomBytes, pbkdf2 } from "crypto";

interface Cipher {
	algorithm: string;
	iv: string;
	cipherText: string;
}

interface KeyFileData extends Cipher {
	salt: string;
}


function randomKey(): string {
	return "x'" + randomBytes(32).toString("hex") + "'";
}

function deriveKey(passphrase: string, salt: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const iterations = 1000; 
		const keylen = 32;
		pbkdf2(passphrase, salt, iterations, keylen, (err: Error, derivedKey: Buffer) => {
			if (err) {
				reject(err);
			}
			else {
				resolve(derivedKey.toString("base64"));
			}
		});
	});
}

function encrypt(key: Buffer, plainText: string): Cipher {
	const algorithm = "aes-256-cbc";
	const inputEncoding = "utf8";
	const outputEncoding = "base64";
	const ivbuf = randomBytes(16);
	const iv = ivbuf.toString("base64");
	const cipher = createCipheriv(algorithm, key, iv);
	let cipherText = cipher.update(plainText, inputEncoding, outputEncoding);
	cipherText += cipher.final(outputEncoding);
	return { algorithm, iv, cipherText };
}

function decrypt(key: Buffer, cipher: Cipher): string {
	const inputEncoding = "base64";
	const outputEncoding = "utf8";
	const decipher = createDecipheriv(cipher.algorithm, key, cipher.iv);
	let plainText = decipher.update(cipher.cipherText, inputEncoding, outputEncoding);
	plainText += decipher.final(outputEncoding);
	return plainText;
}

function tryOpenKeyFile(file: KeyFileData, passphrase: string): Promise<string> {
	return deriveKey(passphrase, file.salt)
	.then((key: string) => {
		return "";
	});
}