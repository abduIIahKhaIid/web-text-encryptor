# 🔐 Web Text Encryptor

A web-based encryption tool that allows users to encrypt and decrypt text using various algorithms including Caesar Cipher, AES, DES, RSA, and Base64.

🚀 **Live App:** [https://web-text-encryptor-git-main-abdullah-khalids-projects.vercel.app/](https://web-text-encryptor-git-main-abdullah-khalids-projects.vercel.app/)

---

## 📌 Features

- 🔤 Enter plain text to encrypt or decrypt
- 📂 Select from multiple encryption algorithms:
  - Caesar Cipher
  - AES (simulation)
  - DES (simulation)
  - RSA (simulation)
  - Base64
- 🔁 Supports both **encryption** and **decryption** (where applicable)
- 🧮 Includes **SHA-256** and **MD5** hashing options (one-way)
- 🛡️ Input validation for empty text and missing selection
- 📋 Copy ciphertext to clipboard with one click
- 🧪 Simple, clean UI with user-friendly experience

---

## ⚙️ Technologies Used

- **Frontend:** React, Next.js (App Router with Client Components)
- **Icons:** Lucide React
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

---

## 🧠 Algorithms Simulated

| Algorithm     | Encrypt | Decrypt | Key Required | Type        |
|---------------|---------|---------|--------------|-------------|
| Caesar Cipher | ✅      | ✅      | Yes (number) | Symmetric   |
| AES           | ✅      | ✅      | Simulated    | Symmetric   |
| DES           | ✅      | ✅      | Simulated    | Symmetric   |
| RSA           | ✅      | ✅      | Simulated    | Asymmetric  |
| Base64        | ✅      | ✅      | No           | Encoding    |
| SHA-256       | ✅      | ❌      | No           | Hashing     |
| MD5           | ✅      | ❌      | No           | Hashing     |

> 🔒 Note: AES, DES, and RSA are simulated for demo purposes and **not cryptographically secure**.

---

## 🧪 How to Use

1. Visit the app: [web-text-encryptor.vercel.app](https://web-text-encryptor-git-main-abdullah-khalids-projects.vercel.app/)
2. Enter the text you want to encrypt or decrypt.
3. Choose an encryption algorithm from the dropdown.
4. (If required) Enter a key (e.g., Caesar shift).
5. Choose `Encrypt` or `Decrypt` mode.
6. Click the button to process the text.
7. Copy the result using the clipboard icon.

---

## 📷 Screenshots (Optional)

> You can add screenshots by placing images in a `/public/screenshots/` folder and linking like so:

```markdown
![Encryption UI](public/screenshots/encryption-ui.png)
