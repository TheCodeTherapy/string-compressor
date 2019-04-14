/*eslint no-console: ["error", { allow: ["log"] }] */

const mocha = require( 'mocha' );
const chai = require( 'chai' );

const suite = mocha.suite;
const test = mocha.test;
const expect = chai.expect;

const {
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
} = require( '../index' );


suite( 'string-compressor tests', () => {

    let uncompressedSize = 0;
    let compressedSize = 0;
    let ratio = 0;

    test( 'utf-8 string is identical after compression and decompression', () => {

        const utf8String = 'Isn\'t it enough to see that a garden is beautiful? 庭園';
        const hashedString = stringToHash( utf8String ); // compress string
        const unhashedString = hashToString( hashedString ); // decompress hash
        expect( utf8String ).to.be.equal( unhashedString );

    } );

    test( 'estimate memory size for a 256 Bytes ASCII string ( 256 ASCII chars = 256 Bytes )', () => {

        let strArray = '';
        for ( let i = 0; i < 256; i++ ) { strArray = strArray.concat( 'a' ); i++; } // ASCII string with 256 chars (1 byte each)
        const strSize = roughSizeOf( strArray );
        expect( strSize ).to.be.equal( '256 Bytes' );

    } );

    test( 'estimate memory size for a 2 MB ASCII string ( 2097152 ASCII chars = 2MB ) ', () => {

        let strArray = '';
        for ( let i = 0; i < 2097152; i++ ) { strArray = strArray.concat( 'a' ); i++; } // 2 MB ASCII characters string
        const strSize = roughSizeOf( strArray );
        expect( strSize ).to.be.equal( '2 MB' );

    } );

    test( 'compression efficiency for UTF-8 hex-representation-encoded string', () => {

        let strArray = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ╚╝╔╗█ぁあぃいぅうぇえぉおかがきぎく'.split( '' );
        let rndArray = '';

        const pickRandom = () => {

            return strArray[ Math.floor( Math.random() * strArray.length ) ]; 

        };

        for ( let i = 0; i < 524288; i++ ) {

            rndArray = rndArray + pickRandom(); i++;

        }

        const encoded = encodeUTF8( rndArray.trim() );
        const compressed = compress( encoded );
        const hexCompressed = convertBytesToHex( compressed );

        uncompressedSize = parseInt( roughSizeOf( encoded, false ) );
        compressedSize = parseInt( roughSizeOf( hexCompressed, false ) );

        expect( compressedSize ).to.be.lessThan( uncompressedSize );

    } );

    test( 'more than 50% compression efficiency for compressed UTF-8 hex-encoded string', () => {

        ratio = 100 - ( ( compressedSize * 100 ) / uncompressedSize );    
        expect( ratio ).to.be.greaterThan( 50 );

    } );
    
} );
