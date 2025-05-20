'use client';

import { useState } from 'react';
import { Copy, Check, Lock, Unlock } from 'lucide-react';
import CryptoJS from 'crypto-js';

type CipherMethod = 'caesar' | 'xor' | 'base64' | 'sha256' | 'md5' | 'aes' | 'des' | 'rsa';

interface Algorithm {
  value: CipherMethod;
  label: string;
  needsKey: boolean;
  keyType?: 'number' | 'text';
  keyPlaceholder?: string;
}

export default function EncryptionApp() {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<CipherMethod | ''>('');
  const [numericKey, setNumericKey] = useState<string>('');
  const [textKey, setTextKey] = useState<string>('');
  const [rsaExp, setRsaExp] = useState<string>('');
  const [rsaMod, setRsaMod] = useState<string>('');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const algorithms: Algorithm[] = [
    { value: 'caesar', label: 'Caesar Cipher', needsKey: true, keyType: 'number', keyPlaceholder: '0-25' },
    // { value: 'xor', label: 'XOR Encryption', needsKey: true, keyType: 'text', keyPlaceholder: 'your_secret_key' },
    { value: 'base64', label: 'Base64 Encode/Decode', needsKey: false },
    { value: 'sha256', label: 'SHA-256 Hash', needsKey: false },
    { value: 'md5', label: 'MD5 Hash', needsKey: false },
    { value: 'aes', label: 'AES Encryption', needsKey: true, keyType: 'text', keyPlaceholder: 'secret_key' },
    { value: 'des', label: 'DES Encryption', needsKey: true, keyType: 'text', keyPlaceholder: 'secret_key' },
    // { value: 'rsa', label: 'RSA (Simulated)', needsKey: true, keyType: 'text', keyPlaceholder: 'exponent, modulus' },
  ];

  const validateInput = (): boolean => {
    if (!inputText.trim()) {
      setError('Please enter some text to process');
      return false;
    }
    if (!selectedAlgorithm) {
      setError('Please select an algorithm');
      return false;
    }
    if (selectedAlgorithm === 'caesar') {
      const shift = parseInt(numericKey, 10);
      if (isNaN(shift) || shift < 0 || shift > 25) {
        setError('Please enter a valid shift value (0-25)');
        return false;
      }
    }
    if (['xor', 'aes', 'des'].includes(selectedAlgorithm) && textKey.trim() === '') {
      setError('Please enter a secret key');
      return false;
    }
    if (selectedAlgorithm === 'rsa' && (rsaExp.trim() === '' || rsaMod.trim() === '')) {
      setError('Please enter both RSA exponent and modulus');
      return false;
    }
    setError('');
    return true;
  };

  // Use TextEncoder/TextDecoder for robust UTF-8 handling
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const caesarCipher = (text: string, shift: number, decrypt = false) => {
    let s = ((shift % 26) + 26) % 26;
    if (decrypt) s = (26 - s) % 26;
    return Array.from(text).map(char => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + s) % 26) + 65);
      }
      if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + s) % 26) + 97);
      }
      return char;
    }).join('');
  };

  const xorCipher = (text: string, key: string) => {
    const keyChars = Array.from(key);
    return Array.from(text).map((char, i) => {
      const k = keyChars[i % keyChars.length].charCodeAt(0);
      const c = char.charCodeAt(0) ^ k;
      return String.fromCharCode(c);
    }).join('');
  };

  const base64Encode = (text: string) =>
    btoa(String.fromCharCode(...encoder.encode(text)));

  const base64Decode = (text: string) => {
    const bytes = Uint8Array.from(atob(text), c => c.charCodeAt(0));
    return decoder.decode(bytes);
  };

  const sha256Hash = (text: string) =>
    CryptoJS.SHA256(text).toString(CryptoJS.enc.Hex);

  const md5Hash = (text: string) =>
    CryptoJS.MD5(text).toString(CryptoJS.enc.Hex);

  const aesProcess = (text: string, key: string, decrypt = false): string => {
    try {
      if (decrypt) {
        const bytes = CryptoJS.AES.decrypt(text, key);
        const plaintext = bytes.toString(CryptoJS.enc.Utf8);
        if (!plaintext) throw new Error();
        return plaintext;
      }
      return CryptoJS.AES.encrypt(text, key).toString();
    } catch {
      throw new Error('AES processing failed (wrong key or malformed data)');
    }
  };

  const desProcess = (text: string, key: string, decrypt = false): string => {
    try {
      if (decrypt) {
        const bytes = CryptoJS.DES.decrypt(text, key);
        const plaintext = bytes.toString(CryptoJS.enc.Utf8);
        if (!plaintext) throw new Error();
        return plaintext;
      }
      return CryptoJS.DES.encrypt(text, key).toString();
    } catch {
      throw new Error('DES processing failed (wrong key or malformed data)');
    }
  };

  const simulateRSA = (text: string, exp: string, mod: string) => {
    const e = BigInt(exp);
    const n = BigInt(mod);
    return Array.from(text).map(c => {
      const m = BigInt(c.charCodeAt(0));
      const res = m ** e % n;
      return String.fromCharCode(Number(res));
    }).join('');
  };

  const processText = () => {
    if (!validateInput()) return;
    try {
      let result = '';
      switch (selectedAlgorithm) {
        case 'caesar':
          result = caesarCipher(inputText, parseInt(numericKey, 10), mode === 'decrypt');
          break;
        case 'xor':
          result = xorCipher(inputText, textKey);
          break;
        case 'base64':
          result = mode === 'encrypt' ? base64Encode(inputText) : base64Decode(inputText);
          break;
        case 'sha256':
          result = sha256Hash(inputText);
          break;
        case 'md5':
          result = md5Hash(inputText);
          break;
        case 'aes':
          result = aesProcess(inputText, textKey, mode === 'decrypt');
          break;
        case 'des':
          result = desProcess(inputText, textKey, mode === 'decrypt');
          break;
        case 'rsa':
          result = simulateRSA(inputText, rsaExp, rsaMod);
          break;
        default:
          result = '';
      }
      setOutputText(result);
      setError('');
    } catch (e: any) {
      setError(e.message || 'Processing error');
      setOutputText('');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const selectedAlgo = algorithms.find(a => a.value === selectedAlgorithm);
  const isHash = ['sha256', 'md5'].includes(selectedAlgorithm as string);
  const canDecrypt = !isHash && selectedAlgorithm !== 'rsa';

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">Text Encryption Tool</h1>

      {error && <div className="bg-red-100 border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Mode:</label>
        <div className="flex space-x-4">
          <button
            onClick={() => setMode('encrypt')}
            className={`flex items-center px-4 py-2 rounded ${mode === 'encrypt' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            <Lock className="mr-2 h-4 w-4" />Encrypt
          </button>
          <button
            onClick={() => canDecrypt && setMode('decrypt')}
            className={`flex items-center px-4 py-2 rounded ${mode === 'decrypt' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            disabled={!canDecrypt}
          >
            <Unlock className="mr-2 h-4 w-4" />Decrypt
          </button>
        </div>
        {isHash && mode === 'decrypt' && <p className="text-sm text-red-500 mt-1">Hash functions are one-directional and cannot be decrypted.</p>}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Select Algorithm:</label>
        <select
          value={selectedAlgorithm}
          onChange={e => { setSelectedAlgorithm(e.target.value as CipherMethod); setOutputText(''); setError(''); }}
          className="w-full px-4 py-2 border rounded"
        >
          <option value="">-- Select Encryption Method --</option>
          {algorithms.map(algo => <option key={algo.value} value={algo.value}>{algo.label}</option>)}
        </select>
      </div>

      {selectedAlgorithm === 'caesar' && (
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Shift (0-25):</label>
          <input
            type="number"
            value={numericKey}
            onChange={e => setNumericKey(e.target.value)}
            min={0} max={25}
            className="w-full px-4 py-2 border rounded"
            placeholder={selectedAlgo?.keyPlaceholder}
          />
        </div>
      )}

      {['xor','aes','des'].includes(selectedAlgorithm as string) && (
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Secret Key:</label>
          <input
            type="text"
            value={textKey}
            onChange={e => setTextKey(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            placeholder={selectedAlgo?.keyPlaceholder}
          />
        </div>
      )}

      {selectedAlgorithm === 'rsa' && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-2">Exponent (e or d):</label>
            <input
              type="text"
              value={rsaExp}
              onChange={e => setRsaExp(e.target.value)}
              className="w-full px-4 py-2 border rounded"
              placeholder={selectedAlgo?.keyPlaceholder?.split(',')[0].trim()}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Modulus (n):</label>
            <input
              type="text"
              value={rsaMod}
              onChange={e => setRsaMod(e.target.value)}
              className="w-full px-4 py-2 border rounded"
              placeholder={selectedAlgo?.keyPlaceholder?.split(',')[1].trim()}
            />
          </div>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 mb-2">{mode === 'encrypt' ? 'Plain Text:' : 'Cipher Text:'}</label>
        <textarea
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          className="w-full px-4 py-2 border rounded h-32"
          placeholder={mode === 'encrypt' ? 'Enter text to encrypt' : 'Enter text to decrypt'}
        />
      </div>

      <div className="flex justify-center mb-4">
        <button
          onClick={processText}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-2">{mode === 'encrypt' ? 'Cipher Text:' : 'Plain Text:'}</label>
        <div className="relative">
          <textarea
            value={outputText}
            readOnly
            className="w-full px-4 py-2 border rounded h-32 bg-gray-50"
          />
          {outputText && (
            <button
              onClick={copyToClipboard}
              className="absolute top-2 right-2 p-2 bg-gray-200 rounded-full hover:bg-gray-300"
              title="Copy to clipboard"
            >
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
