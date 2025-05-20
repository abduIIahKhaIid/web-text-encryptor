'use client';

import { useState } from 'react';
import { Copy, Check, Lock, Unlock } from 'lucide-react';

type CipherMethod = 'caesar' | 'xor' | 'base64' | 'sha256' | 'md5';

interface Algorithm {
    value: CipherMethod;
    label: string;
    needsKey: boolean;
    keyType?: 'number' | 'text';
}

export default function EncryptionApp() {
    const [inputText, setInputText] = useState<string>('');
    const [outputText, setOutputText] = useState<string>('');
    const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('');
    const [key, setKey] = useState<string>('');
    const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
    const [copied, setCopied] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const algorithms: Algorithm[] = [
        { value: 'caesar', label: 'Caesar Cipher', needsKey: true, keyType: 'number' },
        { value: 'xor', label: 'XOR Encryption', needsKey: true, keyType: 'text' },
        { value: 'base64', label: 'Base64 Encoding', needsKey: false },
        { value: 'sha256', label: 'SHA-256 Hash (Simulation)', needsKey: false },
        { value: 'md5', label: 'MD5 Hash (Simulation)', needsKey: false },
    ];

    const validateInput = (): boolean => {
        if (!inputText.trim()) {
            setError('Please enter some text to process');
            return false;
        }
        if (!selectedAlgorithm) {
            setError('Please select an encryption algorithm');
            return false;
        }
        const algo = algorithms.find(a => a.value === selectedAlgorithm)!;
        if (algo.needsKey && !key.trim()) {
            setError(`Please enter a ${algo.keyType === 'number' ? 'number' : 'key'} for ${algo.label}`);
            return false;
        }
        setError('');
        return true;
    };

    // —————————————————————————————————————————
    // Helper functions, now fully typed
    // —————————————————————————————————————————

    const caesarCipher = (text: string, shift: number, decrypt = false): string => {
        // Normalize shift to between 0–25
        let s = ((shift % 26) + 26) % 26;
        if (decrypt) s = (26 - s) % 26;

        return Array.from(text).map(char => {
            const code = char.charCodeAt(0);
            // Uppercase A–Z
            if (code >= 65 && code <= 90) {
                return String.fromCharCode(((code - 65 + s) % 26) + 65);
            }
            // Lowercase a–z
            if (code >= 97 && code <= 122) {
                return String.fromCharCode(((code - 97 + s) % 26) + 97);
            }
            return char;
        }).join('');
    };

    const xorCipher = (text: string, key: string): string => {
        const keyChars = Array.from(key);
        return Array.from(text).map((char, i) => {
            const k = keyChars[i % keyChars.length].charCodeAt(0);
            const c = char.charCodeAt(0) ^ k;
            return String.fromCharCode(c);
        }).join('');
    };

    const base64Encode = (text: string): string => {
        try {
            return btoa(unescape(encodeURIComponent(text)));
        } catch {
            return '';
        }
    };
    const base64Decode = (text: string): string => {
        try {
            return decodeURIComponent(escape(atob(text)));
        } catch {
            return '';
        }
    };

    const simpleHash = (text: string): string => {
        let h = 0;
        if (!text) return '0';
        for (const char of text) {
            h = ((h << 5) - h) + char.charCodeAt(0);
            h |= 0; // to 32-bit
        }
        return Math.abs(h).toString(16);
    };

    const sha256Like = (text: string): string => {
        const base = simpleHash(text);
        let h = '';
        for (let i = 0; i < 8; i++) {
            h += simpleHash(text + i + base).padStart(8, '0');
        }
        return h.slice(0, 64);
    };

    const md5Like = (text: string): string => {
        return simpleHash(text).padStart(32, '0').slice(0, 32);
    };

    // —————————————————————————————————————————
    // Main processText
    // —————————————————————————————————————————

    const processText = () => {
        if (!validateInput()) return;

        try {
            let result = '';
            switch (selectedAlgorithm) {
                case 'caesar':
                    // parseInt on the key (string) → number
                    result = caesarCipher(inputText, parseInt(key, 10), mode === 'decrypt');
                    break;
                case 'xor':
                    result = xorCipher(inputText, key);
                    break;
                case 'base64':
                    result = mode === 'encrypt'
                        ? base64Encode(inputText)
                        : base64Decode(inputText);
                    break;
                case 'sha256':
                    result = sha256Like(inputText);
                    break;
                case 'md5':
                    result = md5Like(inputText);
                    break;
            }
            setOutputText(result);
            setError('');
        } catch (e: any) {
            setError(`Processing error: ${e.message || 'Unknown error'}`);
            setOutputText('');
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(outputText).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const selectedAlgo = algorithms.find(algo => algo.value === selectedAlgorithm);
    const showKeyInput = selectedAlgo?.needsKey;
    const isHashAlgorithm = ['sha256', 'md5'].includes(selectedAlgorithm);

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">Text Encryption Tool</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Mode:</label>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setMode('encrypt')}
                            className={`flex items-center px-4 py-2 rounded ${mode === 'encrypt' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                        >
                            <Lock className="mr-2 h-4 w-4" />
                            Encrypt
                        </button>
                        <button
                            onClick={() => setMode('decrypt')}
                            className={`flex items-center px-4 py-2 rounded ${mode === 'decrypt' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                            disabled={isHashAlgorithm}
                        >
                            <Unlock className="mr-2 h-4 w-4" />
                            Decrypt
                        </button>
                    </div>
                    {isHashAlgorithm && mode === 'decrypt' && (
                        <p className="text-sm text-red-500 mt-1">Hash functions are one-way and cannot be decrypted.</p>
                    )}
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Select Algorithm:</label>
                    <select
                        value={selectedAlgorithm}
                        onChange={(e) => {
                            const algo = e.target.value as CipherMethod;
                            setSelectedAlgorithm(algo);
                            if (['sha256', 'md5'].includes(e.target.value) && mode === 'decrypt') {
                                setMode('encrypt');
                            }
                        }}
                        className="w-full px-4 py-2 border rounded"
                    >
                        <option value="">-- Select Encryption Method --</option>
                        {algorithms.map(algo => (
                            <option key={algo.value} value={algo.value}>
                                {algo.label}
                            </option>
                        ))}
                    </select>
                </div>

                {showKeyInput && (
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">
                            {selectedAlgo.keyType === 'number' ? 'Shift Value (0-25):' : 'Secret Key:'}
                        </label>
                        <input
                            type={selectedAlgo.keyType === 'number' ? 'number' : 'text'}
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            className="w-full px-4 py-2 border rounded"
                            min={selectedAlgo.keyType === 'number' ? 0 : undefined}
                            max={selectedAlgo.keyType === 'number' ? 25 : undefined}
                            placeholder={selectedAlgo.keyType === 'number' ? 'Enter a number between 0-25' : 'Enter your secret key'}
                        />
                    </div>
                )}

                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                        {mode === 'encrypt' ? 'Plain Text:' : 'Cipher Text:'}
                    </label>
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
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
                    <label className="block text-gray-700 mb-2">
                        {mode === 'encrypt' ? 'Cipher Text:' : 'Plain Text:'}
                    </label>
                    <div className="relative">
                        <textarea
                            value={outputText}
                            readOnly
                            className="w-full px-4 py-2 border rounded h-32 bg-gray-50"
                        />
                        {outputText && (
                            <button
                                onClick={copyToClipboard}
                                className="absolute top-2 right-2 p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                                title="Copy to clipboard"
                            >
                                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}