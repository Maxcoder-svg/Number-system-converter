# Number System Converter

A Progressive Web App (PWA) that converts numbers between different number systems including binary, octal, decimal, and hexadecimal. Works as both a web application and can be installed as a mobile app on Android devices.

## Features

- **Real-time Conversion**: Convert between binary, octal, decimal, and hexadecimal number systems instantly
- **Mobile-First Design**: Responsive UI optimized for mobile devices and touch interactions
- **Progressive Web App**: Can be installed on mobile devices and works offline
- **Input Validation**: Prevents invalid characters and provides immediate feedback
- **Copy Results**: Easy copy-to-clipboard functionality for all conversion results
- **Keyboard Shortcuts**: Efficient keyboard navigation and shortcuts
- **Dark Mode Support**: Automatic dark mode based on system preferences
- **Cross-Platform**: Works on any device with a modern web browser

## Getting Started

### Web Application

1. Simply open `index.html` in any modern web browser
2. The app will work immediately with no installation required
3. For the best mobile experience, visit the app on your phone's browser

### Android App Installation

1. **Via Browser**: 
   - Open the app in Chrome or any modern browser on Android
   - Tap the "Install App" button when it appears
   - Or use the browser menu → "Add to Home Screen"

2. **PWA Features**:
   - Works offline after first load
   - App-like experience with no browser UI
   - Fast loading and smooth animations

## How to Use

### Basic Conversion

1. **Enter a number** in any of the four input fields:
   - **Binary**: Only 0s and 1s (e.g., `1010`)
   - **Octal**: Digits 0-7 (e.g., `755`)  
   - **Decimal**: Digits 0-9 (e.g., `42`)
   - **Hexadecimal**: Digits 0-9 and A-F (e.g., `FF`)

2. **View results** automatically in the results section
3. **Copy results** using the "Copy Results" button
4. **Clear all** using the "Clear All" button or `Escape` key

### Keyboard Shortcuts

- **Escape**: Clear all inputs and results
- **Ctrl/Cmd + K**: Clear all inputs and results  
- **Ctrl/Cmd + C**: Copy results to clipboard (when not in input field)

## Technical Details

### Architecture

The application is built using vanilla JavaScript with a modern, modular architecture:

- **HTML5**: Semantic markup with progressive enhancement
- **CSS3**: Modern styling with CSS Grid, Flexbox, and custom properties
- **JavaScript ES6+**: Modular code with classes and modern syntax
- **Service Worker**: Offline functionality and caching
- **Web App Manifest**: PWA configuration for installation

### Browser Support

- **Modern browsers**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **Mobile browsers**: Chrome Mobile, Safari Mobile, Samsung Internet
- **PWA features**: Supported on Android (Chrome), limited on iOS

### File Structure

```
├── index.html              # Main HTML file
├── manifest.json          # PWA manifest
├── sw.js                  # Service worker
├── styles/
│   └── main.css          # Main stylesheet
├── js/
│   ├── converter.js      # Number conversion logic
│   └── app.js           # PWA and app initialization
├── icons/               # App icons
├── docs/               # Documentation
└── README.md          # This file
```

## Development

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Maxcoder-svg/Number-system-converter.git
   cd Number-system-converter
   ```

2. **Serve the files**:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**: Navigate to `http://localhost:8000`

### Building for Production

The app is designed to work without a build process. Simply:

1. Copy all files to your web server
2. Ensure HTTPS is enabled for PWA features
3. Verify the manifest.json paths match your deployment

### Testing

- **Manual Testing**: Test conversion accuracy with known values
- **PWA Testing**: Use Chrome DevTools → Application tab → Manifest
- **Mobile Testing**: Test installation and offline functionality
- **Accessibility**: Verify keyboard navigation and screen reader support

## Number System Information

### Binary (Base 2)
- **Digits**: 0, 1
- **Used in**: Computer science, digital electronics
- **Example**: `1010` = 10 in decimal

### Octal (Base 8)  
- **Digits**: 0, 1, 2, 3, 4, 5, 6, 7
- **Used in**: Unix file permissions, older computer systems
- **Example**: `755` = 493 in decimal

### Decimal (Base 10)
- **Digits**: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9  
- **Used in**: Standard counting system
- **Example**: `42` = 42 in decimal

### Hexadecimal (Base 16)
- **Digits**: 0-9, A, B, C, D, E, F
- **Used in**: Programming, color codes, memory addresses
- **Example**: `FF` = 255 in decimal

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

### Areas for Enhancement

- [ ] Support for negative numbers
- [ ] Floating-point number conversion  
- [ ] Additional number bases (e.g., base 32)
- [ ] History of recent conversions
- [ ] Mathematical operations between different bases
- [ ] Educational mode with step-by-step conversion explanations

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/Maxcoder-svg/Number-system-converter/issues) page
2. Create a new issue with detailed information about the problem
3. For general questions, use the [Discussions](https://github.com/Maxcoder-svg/Number-system-converter/discussions) section
