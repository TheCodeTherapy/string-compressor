/*eslint no-console: ["error", { allow: ["error", "info"] }] */

const pako = require( 'pako' );


const convertHexToBytes = ( text )  => {

    let tmpHex, array = [];

    for ( let i = 0; i < text.length; i += 2 ) {

        tmpHex = text.substring( i, i + 2 );
        array.push( parseInt( tmpHex, 16 ) );
    
    }

    return array;

};


const convertBytesToHex = ( byteArray ) => {

    let tmpHex, hex = '';

    for ( let i = 0, il = byteArray.length; i < il; i ++ ) {

        if ( byteArray[ i ] < 0 ) {

            byteArray[ i ] = byteArray[ i ] + 256;
        
        }

        tmpHex = byteArray[ i ].toString( 16 );

        if ( tmpHex.length === 1 ) { // add leading zero

            tmpHex = '0' + tmpHex;

        }

        hex += tmpHex;
    
    }

    return hex;

};


const bytesToHumanReadableSize = ( bytes, decimals = 2 ) => {

    if ( bytes === 0 ) { return '0 Bytes'; }

    const magnitude = 1024;

    const dm = ( decimals <= 0 || decimals === null || decimals === undefined )
        ? 0
        : decimals;

    const sizes = [ 'Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB' ];

    let i = Math.floor( Math.log( bytes ) / Math.log( magnitude ) );

    return parseFloat( ( bytes / Math.pow( magnitude, i ) ).toFixed( dm ) ) + ' ' + sizes[ i ];

};


const roughSizeOf = ( object, humanReadable = true ) => {

    let objectList = [];
    let stack = [ object ];
    let bytes = 0;

    while ( stack.length ) {

        let value = stack.pop();
        if ( typeof value === 'boolean' ) { bytes += 4; }
        else if ( typeof value === 'string' ) { bytes += value.length * 2; }
        else if ( typeof value === 'number' ) { bytes += 8; }
        else if ( typeof value === 'object' && objectList.indexOf( value ) === -1 ) {

            objectList.push( value );

            for( let i in value ) { stack.push( value[ i ] ); }
        
        }
    
    }

    return ( humanReadable ) ? bytesToHumanReadableSize( bytes ) : bytes;

};


const encodeUTF8 = ( s ) => {

    let i = 0, bytes = new Uint8Array( s.length * 4 );

    for ( let ci = 0; ci !== s.length; ci++ ) {

        let c = s.charCodeAt( ci );
        if ( c < 128 ) { bytes[ i++ ] = c; continue; }
        if ( c < 2048 ) { bytes[ i++ ] = ( c >> 6 ) | 192; }
        else {

            if ( c > 0xd7ff && c < 0xdc00 ) {

                if ( ++ci >= s.length ) {

                    throw new Error( 'UTF-8 encode: incomplete surrogate pair' );

                }

                let c2 = s.charCodeAt( ci );
                if ( c2 < 0xdc00 || c2 > 0xdfff ) {

                    throw new Error( 'UTF-8 encode: second surrogate character 0x' + c2.toString( 16 ) + ' at index ' + ci + ' out of range' );

                }

                c = 0x10000 + ( ( c & 0x03ff ) << 10 ) + ( c2 & 0x03ff );
                bytes[i++] = ( c >> 18 ) | 240;
                bytes[i++] = ( ( c >> 12 ) & 63 ) | 128;
            
            } else {

                bytes[i++] = ( c >> 12 ) | 224;

            }

            bytes[i++] = ( ( c >> 6 ) & 63 ) | 128;
        
        }

        bytes[i++] = ( c & 63 ) | 128;
    
    }

    return bytes.subarray( 0, i );

};


const decodeUTF8 = ( bytes ) => {

    let i = 0, s = '';
    while ( i < bytes.length ) {

        let c = bytes[i++];
        if ( c > 127 ) {

            if ( c > 191 && c < 224 ) {

                if ( i >= bytes.length ) {

                    throw new Error( 'UTF-8 decode: incomplete 2-byte sequence' );

                }

                c = ( ( c & 31 ) << 6 ) | ( bytes[i++] & 63 );
            
            } else if ( c > 223 && c < 240 ) {

                if ( i + 1 >= bytes.length ) {

                    throw new Error( 'UTF-8 decode: incomplete 3-byte sequence' );

                }

                c = ( ( c & 15 ) << 12 ) | ( ( bytes[i++] & 63 ) << 6 ) | ( bytes[i++] & 63 );
            
            } else if ( c > 239 && c < 248 ) {

                if ( i + 2 >= bytes.length ) {

                    throw new Error( 'UTF-8 decode: incomplete 4-byte sequence' );

                }

                c = ( ( c & 7 ) << 18 ) | ( ( bytes[i++] & 63 ) << 12 ) | ( ( bytes[i++] & 63 ) << 6 ) | ( bytes[i++] & 63 );
            
            } else {

                throw new Error( 'UTF-8 decode: unknown multi-byte start 0x' + c.toString( 16 ) + ' at index ' + ( i - 1 ) );

            }
        
        }
        if ( c <= 0xffff ) { s += String.fromCharCode( c ); }
        else if ( c <= 0x10ffff ) {

            c -= 0x10000;
            s += String.fromCharCode( ( c >> 10 ) | 0xd800 );
            s += String.fromCharCode( ( c & 0x3FF ) | 0xdc00 );
        
        } else {

            throw new Error( 'UTF-8 decode: code point 0x' + c.toString( 16 ) + ' exceeds UTF-16 reach' );

        }
    
    }

    return s;

};


const compress = ( arr ) => {

    const compressedArrBytes = pako.deflate( arr, { level: 9 } );

    return compressedArrBytes;

};


const decompress = ( bytes ) => {

    try {

        const decompressedArray = pako.inflate( bytes );

        return decompressedArray;
    
    } catch ( err ) {

        console.error( err );
    
    }

};


const stringToHash = ( str, consoleInfo = false ) => {

    let encoded = encodeUTF8( str.trim() );
    let compressed = compress( encoded );
    let hexCompressed = convertBytesToHex( compressed );

    if ( consoleInfo ) {

        console.info( `String:         ${roughSizeOf( str )}` );
        console.info( `Encoded:        ${roughSizeOf( encoded )}` );
        console.info( `Compressed:     ${roughSizeOf( compressed )}` );
        console.info( `hexCompressed:  ${roughSizeOf( hexCompressed )}` );
    
    }

    return hexCompressed;

};


const hashToString = ( hash, consoleInfo = false ) => {

    let deHexed = convertHexToBytes( hash );
    let decompressed = decompress( deHexed );
    let decoded = decodeUTF8( decompressed );

    if ( consoleInfo ) {

        console.info( `deHexed:        ${roughSizeOf( deHexed )}` );
        console.info( `Decompressed:   ${roughSizeOf( decompressed )}` );
        console.info( `Decoded String: ${roughSizeOf( decoded )}` );
    
    }

    return decoded;

};


module.exports = {
    convertHexToBytes,
    convertBytesToHex,
    bytesToHumanReadableSize,
    roughSizeOf,
    encodeUTF8,
    decodeUTF8,
    compress,
    decompress,
    stringToHash,
    hashToString
};
