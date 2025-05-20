'use client';

import { useState } from 'react';
import { Copy, Check, Lock, Unlock } from 'lucide-react';

export default function EncryptionApp() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('');
  const [key, setKey] = useState('');
  const [mode, setMode] = useState('encrypt');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const algorithms = [
    { value: 'caesar', label: 'Caesar Cipher', needsKey: true, keyType: 'number' },
    { value: 'xor', label: 'XOR Encryption', needsKey: true, keyType: 'text' },
    { value: 'base64', label: 'Base64 Encoding', needsKey: false },
    { value: 'sha256', label: 'SHA-256 Hash (Simulation)', needsKey: false },
    { value: 'md5', label: 'MD5 Hash (Simulation)', needsKey: false },
  ];

  const validateInput = () => {
    if (!inputText.trim()) {
      setError('Please enter some text to process');
      return false;
    }
    
    if (!selectedAlgorithm) {
      setError('Please select an encryption algorithm');
      return false;
    }
    
    const algorithm = algorithms.find(algo => algo.value === selectedAlgorithm);
    if (algorithm && algorithm.needsKey && !key.trim()) {
      setError(`Please enter a ${algorithm.keyType === 'number' ? 'number' : 'key'} for ${algorithm.label}`);
      return false;
    }
    
    setError('');
    return true;
  };

  // Custom encryption implementations
  
  // Caesar Cipher implementation
  const caesarCipher = (text, shift, decrypt = false) => {
    // Normalize shift to be between 0-25
    shift = ((parseInt(shift) % 26) + 26) % 26;
    
    if (decrypt) {
      shift = (26 - shift) % 26;
    }
    
    return text.split('').map(char => {
      const code = char.charCodeAt(0);
      
      // Handle uppercase letters
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + shift) % 26) + 65);
      }
      // Handle lowercase letters
      else if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + shift) % 26) + 97);
      }
      // Leave non-alphabetic characters unchanged
      return char;
    }).join('');
  };

  // Simple XOR encryption/decryption
  const xorCipher = (text, key) => {
    const keyChars = key.split('');
    
    return text.split('').map((char, i) => {
      // Use modulo to cycle through the key characters
      const keyChar = keyChars[i % keyChars.length];
      // XOR the character code with the key character code
      const charCode = char.charCodeAt(0) ^ keyChar.charCodeAt(0);
      return String.fromCharCode(charCode);
    }).join('');
  };

  // Base64 encoding/decoding
  const base64Encode = (text) => {
    try {
      return btoa(unescape(encodeURIComponent(text)));
    } catch (e) {
      return '';
    }
  };

  const base64Decode = (text) => {
    try {
      return decodeURIComponent(escape(atob(text)));
    } catch (e) {
      // Handle invalid Base64 input
      return '';
    }
  };

  // Simple hash function (not cryptographically secure)
  const simpleHash = (text) => {
    let hash = 0;
    if (text.length === 0) return hash.toString(16);
    
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(16);
  };
  
  // SHA-256-like hash (simplified version, not cryptographically secure)
  const sha256Like = (text) => {
    // Use a combination of techniques to create something that looks like SHA-256
    // but doesn't require the crypto library
    let hash = '';
    
    // First create a simple hash
    const baseHash = simpleHash(text);
    
    // Extend it to look like SHA-256 (64 characters)
    for (let i = 0; i < 8; i++) {
      const chunk = simpleHash(text + i + baseHash);
      hash += chunk.padStart(8, '0');
    }
    
    return hash.substring(0, 64);
  };

  // MD5-like hash (simplified version, not cryptographically secure)
  const md5Like = (text) => {
    // Create a hash that visually resembles MD5 but is not cryptographically sound
    return simpleHash(text).padStart(32, '0').substring(0, 32);
  };

  const processText = () => {
    if (!validateInput()) return;
    
    try {
      let result = '';
      
      switch (selectedAlgorithm) {
        case 'caesar':
          result = caesarCipher(inputText, key, mode === 'decrypt');
          break;
          
        case 'xor':
          // XOR works the same way for encryption and decryption
          result = xorCipher(inputText, key);
          break;
          
        case 'base64':
          if (mode === 'encrypt') {
            result = base64Encode(inputText);
          } else {
            result = base64Decode(inputText);
          }
          break;
          
        case 'sha256':
          result = sha256Like(inputText);
          break;
          
        case 'md5':
          result = md5Like(inputText);
          break;
          
        default:
          setError('Invalid algorithm selected');
          return;
      }
      
      setOutputText(result);
      setError('');
    } catch (err) {
      setError(`Processing error: ${err.message || 'Unknown error'}`);
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
              setSelectedAlgorithm(e.target.value);
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