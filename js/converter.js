/**
 * Number System Converter
 * Handles conversion between binary, octal, decimal, and hexadecimal number systems
 */

class NumberSystemConverter {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.clearAll();
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        // Input elements
        this.binaryInput = document.getElementById('binary-input');
        this.octalInput = document.getElementById('octal-input');
        this.decimalInput = document.getElementById('decimal-input');
        this.hexadecimalInput = document.getElementById('hexadecimal-input');

        // Result elements
        this.binaryResult = document.getElementById('binary-result');
        this.octalResult = document.getElementById('octal-result');
        this.decimalResult = document.getElementById('decimal-result');
        this.hexadecimalResult = document.getElementById('hexadecimal-result');

        // Button elements
        this.clearBtn = document.getElementById('clear-btn');
        this.copyBtn = document.getElementById('copy-btn');

        // Create mapping for easier access
        this.inputs = {
            binary: this.binaryInput,
            octal: this.octalInput,
            decimal: this.decimalInput,
            hexadecimal: this.hexadecimalInput
        };

        this.results = {
            binary: this.binaryResult,
            octal: this.octalResult,
            decimal: this.decimalResult,
            hexadecimal: this.hexadecimalResult
        };
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Input events for real-time conversion
        Object.entries(this.inputs).forEach(([type, input]) => {
            input.addEventListener('input', (e) => this.handleInput(type, e.target.value));
            input.addEventListener('paste', (e) => {
                // Handle paste event with a slight delay to ensure value is set
                setTimeout(() => this.handleInput(type, e.target.value), 10);
            });
        });

        // Button events
        this.clearBtn.addEventListener('click', () => this.clearAll());
        this.copyBtn.addEventListener('click', () => this.copyResults());

        // Prevent invalid characters
        this.binaryInput.addEventListener('keypress', (e) => this.validateInput(e, /[01.]/));
        this.octalInput.addEventListener('keypress', (e) => this.validateInput(e, /[0-7.]/));
        this.decimalInput.addEventListener('keypress', (e) => this.validateInput(e, /[0-9.]/));
        this.hexadecimalInput.addEventListener('keypress', (e) => this.validateInput(e, /[0-9A-Fa-f.]/));
    }

    /**
     * Validate input characters
     * @param {Event} event - The keypress event
     * @param {RegExp} pattern - The allowed pattern
     */
    validateInput(event, pattern) {
        const char = String.fromCharCode(event.which);
        
        // Allow backspace, delete, arrow keys, etc.
        if (event.which <= 32) return;
        
        // Check if character matches the pattern
        if (!pattern.test(char)) {
            event.preventDefault();
            this.showInputError(event.target);
        }
    }

    /**
     * Show input error feedback
     * @param {HTMLElement} input - The input element
     */
    showInputError(input) {
        input.classList.add('error');
        setTimeout(() => input.classList.remove('error'), 300);
    }

    /**
     * Convert fractional part from one base to decimal
     * @param {string} fractionalPart - The fractional part (without the decimal point)
     * @param {number} base - The source base
     * @returns {number} Decimal fractional value
     */
    fractionalToDecimal(fractionalPart, base) {
        let decimalValue = 0;
        for (let i = 0; i < fractionalPart.length; i++) {
            const digit = parseInt(fractionalPart[i], base);
            decimalValue += digit * Math.pow(base, -(i + 1));
        }
        return decimalValue;
    }

    /**
     * Convert decimal fractional part to another base
     * @param {number} fractionalValue - The decimal fractional value (0 < value < 1)
     * @param {number} base - The target base
     * @param {number} precision - Number of fractional digits (default 10)
     * @returns {string} Fractional part in target base
     */
    decimalFractionalToBase(fractionalValue, base, precision = 10) {
        let result = '';
        let value = fractionalValue;
        let iterations = 0;
        
        while (value > 0 && iterations < precision) {
            value *= base;
            const digit = Math.floor(value);
            result += digit.toString(base).toUpperCase();
            value -= digit;
            iterations++;
        }
        
        // Remove trailing zeros
        result = result.replace(/0+$/, '');
        
        return result || '0';
    }

    /**
     * Handle input changes and perform conversions
     * @param {string} sourceType - The type of number system that changed
     * @param {string} value - The input value
     */
    handleInput(sourceType, value) {
        // Clean the input value
        value = value.trim().toUpperCase();
        
        // Clear results if input is empty
        if (!value) {
            this.clearResults();
            return;
        }

        try {
            // Split into integer and fractional parts
            const parts = value.split('.');
            const integerPart = parts[0] || '0';
            const fractionalPart = parts[1] || '';
            
            // Validate that there's only one decimal point
            if (parts.length > 2) {
                throw new Error('Invalid number format - multiple decimal points');
            }
            
            // Convert to decimal first (common base for all conversions)
            let decimalInteger;
            let decimalFractional = 0;
            
            switch (sourceType) {
                case 'binary':
                    if (!/^[01]+$/.test(integerPart)) throw new Error('Invalid binary number');
                    if (fractionalPart && !/^[01]+$/.test(fractionalPart)) throw new Error('Invalid binary fractional part');
                    decimalInteger = parseInt(integerPart, 2);
                    if (fractionalPart) {
                        decimalFractional = this.fractionalToDecimal(fractionalPart, 2);
                    }
                    break;
                    
                case 'octal':
                    if (!/^[0-7]+$/.test(integerPart)) throw new Error('Invalid octal number');
                    if (fractionalPart && !/^[0-7]+$/.test(fractionalPart)) throw new Error('Invalid octal fractional part');
                    decimalInteger = parseInt(integerPart, 8);
                    if (fractionalPart) {
                        decimalFractional = this.fractionalToDecimal(fractionalPart, 8);
                    }
                    break;
                    
                case 'decimal':
                    if (!/^[0-9]+$/.test(integerPart)) throw new Error('Invalid decimal number');
                    if (fractionalPart && !/^[0-9]+$/.test(fractionalPart)) throw new Error('Invalid decimal fractional part');
                    decimalInteger = parseInt(integerPart, 10);
                    if (fractionalPart) {
                        decimalFractional = parseFloat('0.' + fractionalPart);
                    }
                    break;
                    
                case 'hexadecimal':
                    if (!/^[0-9A-F]+$/i.test(integerPart)) throw new Error('Invalid hexadecimal number');
                    if (fractionalPart && !/^[0-9A-F]+$/i.test(fractionalPart)) throw new Error('Invalid hexadecimal fractional part');
                    decimalInteger = parseInt(integerPart, 16);
                    if (fractionalPart) {
                        decimalFractional = this.fractionalToDecimal(fractionalPart, 16);
                    }
                    break;
                    
                default:
                    throw new Error('Unknown number system');
            }

            // Check for valid conversion
            if (isNaN(decimalInteger) || decimalInteger < 0) {
                throw new Error('Invalid number');
            }

            // Combine integer and fractional parts
            const decimalValue = decimalInteger + decimalFractional;

            // Convert to all other number systems
            this.updateResults(decimalValue, decimalInteger, decimalFractional, sourceType);
            
        } catch (error) {
            console.error('Conversion error:', error.message);
            this.showConversionError();
        }
    }

    /**
     * Update all result displays
     * @param {number} decimalValue - The complete decimal value
     * @param {number} decimalInteger - The integer part
     * @param {number} decimalFractional - The fractional part
     * @param {string} sourceType - The source number system
     */
    updateResults(decimalValue, decimalInteger, decimalFractional, sourceType) {
        const conversions = {};
        
        // Convert integer parts
        const binaryInt = decimalInteger.toString(2);
        const octalInt = decimalInteger.toString(8);
        const decimalInt = decimalInteger.toString(10);
        const hexInt = decimalInteger.toString(16).toUpperCase();
        
        // Convert fractional parts if present
        if (decimalFractional > 0) {
            const binaryFrac = this.decimalFractionalToBase(decimalFractional, 2);
            const octalFrac = this.decimalFractionalToBase(decimalFractional, 8);
            const decimalFrac = decimalFractional.toString().split('.')[1] || '';
            const hexFrac = this.decimalFractionalToBase(decimalFractional, 16);
            
            conversions.binary = binaryInt + '.' + binaryFrac;
            conversions.octal = octalInt + '.' + octalFrac;
            conversions.decimal = decimalInt + '.' + decimalFrac;
            conversions.hexadecimal = hexInt + '.' + hexFrac;
        } else {
            conversions.binary = binaryInt;
            conversions.octal = octalInt;
            conversions.decimal = decimalInt;
            conversions.hexadecimal = hexInt;
        }

        // Update all results
        Object.entries(conversions).forEach(([type, result]) => {
            this.results[type].textContent = result;
            this.results[type].classList.remove('error');
        });

        // Store current values for copying
        this.currentValues = conversions;
    }

    /**
     * Show conversion error in results
     */
    showConversionError() {
        Object.values(this.results).forEach(result => {
            result.textContent = 'Error';
            result.classList.add('error');
        });
        this.currentValues = null;
    }

    /**
     * Clear all inputs and results
     */
    clearAll() {
        Object.values(this.inputs).forEach(input => {
            input.value = '';
            input.classList.remove('error');
        });
        this.clearResults();
    }

    /**
     * Clear all results
     */
    clearResults() {
        Object.values(this.results).forEach(result => {
            result.textContent = '-';
            result.classList.remove('error');
        });
        this.currentValues = null;
    }

    /**
     * Copy results to clipboard
     */
    async copyResults() {
        if (!this.currentValues) {
            this.showCopyMessage('No results to copy');
            return;
        }

        try {
            const resultText = [
                `Binary: ${this.currentValues.binary}`,
                `Octal: ${this.currentValues.octal}`,
                `Decimal: ${this.currentValues.decimal}`,
                `Hexadecimal: ${this.currentValues.hexadecimal}`
            ].join('\n');

            await navigator.clipboard.writeText(resultText);
            this.showCopyMessage('Results copied to clipboard!');
        } catch (error) {
            console.error('Copy failed:', error);
            // Fallback for browsers that don't support clipboard API
            this.fallbackCopy(resultText);
        }
    }

    /**
     * Fallback copy method for older browsers
     * @param {string} text - Text to copy
     */
    fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showCopyMessage('Results copied to clipboard!');
        } catch (error) {
            this.showCopyMessage('Copy failed. Please copy manually.');
        }
        
        document.body.removeChild(textArea);
    }

    /**
     * Show copy status message
     * @param {string} message - Message to show
     */
    showCopyMessage(message) {
        // Create or update notification
        let notification = document.querySelector('.copy-notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'copy-notification';
            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1000;
            font-weight: 600;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        // Trigger animation
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Get maximum safe integer for the platform
     * @returns {number} Maximum safe integer
     */
    getMaxSafeInteger() {
        return Number.MAX_SAFE_INTEGER || 9007199254740991;
    }

    /**
     * Validate number is within safe range
     * @param {number} value - Value to validate
     * @returns {boolean} Whether value is safe
     */
    isWithinSafeRange(value) {
        return value <= this.getMaxSafeInteger();
    }
}

// Additional utility functions for extended functionality

/**
 * Utility class for number system operations
 */
class NumberSystemUtils {
    /**
     * Format number with thousand separators
     * @param {string} numberStr - Number as string
     * @returns {string} Formatted number
     */
    static formatWithSeparators(numberStr) {
        return numberStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /**
     * Get number system information
     * @param {string} system - Number system type
     * @returns {Object} System information
     */
    static getSystemInfo(system) {
        const info = {
            binary: {
                name: 'Binary',
                base: 2,
                digits: '0, 1',
                description: 'Base-2 number system used in computing'
            },
            octal: {
                name: 'Octal',
                base: 8,
                digits: '0-7',
                description: 'Base-8 number system, often used in file permissions'
            },
            decimal: {
                name: 'Decimal',
                base: 10,
                digits: '0-9',
                description: 'Standard base-10 number system'
            },
            hexadecimal: {
                name: 'Hexadecimal',
                base: 16,
                digits: '0-9, A-F',
                description: 'Base-16 number system, common in programming'
            }
        };
        
        return info[system] || null;
    }

    /**
     * Calculate the minimum bits needed to represent a decimal number
     * @param {number} decimal - Decimal number
     * @returns {number} Number of bits needed
     */
    static calculateBitsNeeded(decimal) {
        if (decimal === 0) return 1;
        return Math.floor(Math.log2(decimal)) + 1;
    }

    /**
     * Convert decimal to signed binary (two's complement)
     * @param {number} decimal - Decimal number
     * @param {number} bits - Number of bits for representation
     * @returns {string} Signed binary representation
     */
    static toSignedBinary(decimal, bits = 32) {
        if (decimal >= 0) {
            return decimal.toString(2).padStart(bits, '0');
        } else {
            // Two's complement for negative numbers
            const positive = Math.abs(decimal);
            const binary = positive.toString(2);
            const padded = binary.padStart(bits, '0');
            
            // Invert bits
            let inverted = '';
            for (let i = 0; i < padded.length; i++) {
                inverted += padded[i] === '0' ? '1' : '0';
            }
            
            // Add 1
            let result = '';
            let carry = 1;
            for (let i = inverted.length - 1; i >= 0; i--) {
                const sum = parseInt(inverted[i]) + carry;
                result = (sum % 2) + result;
                carry = Math.floor(sum / 2);
            }
            
            return result;
        }
    }
}