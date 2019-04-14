# string-compressor
  
## What?

String-Compressor is a small module that I wrote as a part of a way bigger full-stack project that I'm working on. It serves me to take large strings (multi-line big scarry ones, possibly with lot's of UTF-8 garbage and mixed up line-feeds and non ASCII thingies), and to compress them with zlib algorithm after treating it.

## Why?

After dealing with a lot of setbacks when storing big "messed up" strings on databases, and also when transferring data from/to API/client (and vice-versa) by using encodeURIComponent and other native stuff that may escape things, I decided to pursue my own specific way to treat those big bad ugly strings.

## How?

The *encoding* process is:

- 1: Capture the string from wherever it comes from;
- 2: Transform the string, byte by byte, into a typed array of 8-bit unsigned integer values (handling all the UTF-8 chars properly);
- 3: Compress it with pako (the only dependency of this module, an extremely fast JavaScript zlib implementation);
- 4: Encode it with a method that converts all the bytes one by one pushing them into an array of hexadecimal base values.

To decode the process is reversed.

By the end of the day, I can use this hex-encoded-compressed-thingies to store the big bad ugly strings on my databases, and also to send data between my client and API with no concerns, knowing that the whole string came back absolutely identical.

On a practical use case, for example, a 26 KB multi-line string becomes a 16KB "hex-hash" that gets stored on my database, taking no more than 10ms through the whole encoding + compression process.

## What else?

As part of the whole implementation process, I also created some methods to roughly estimate the size of any object in memory, and also to print it in a human-readable manner. Those methods can be found as *```roughSizeOf```* (method to estimate the size of an object of any kind... array, string, boolean, object, toaster, array of all those previous things, etc.), and as *```bytesToHumanReadableSize```*, which I think is pretty much self-explanatory, converting "\<humongousNumber\> bytes" into "\<lessHumongousNumber\> GB".

## TODO:

Some more test thingies before making it "npm install --save" available.

### Have fun using it.
