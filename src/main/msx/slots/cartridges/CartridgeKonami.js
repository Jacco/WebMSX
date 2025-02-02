// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

// ROMs with (n >= 4) * 8K banks, mapped in 4 8K banks starting at 0x4000
wmsx.CartridgeKonami = function(rom) {

    function init(self) {
        self.rom = rom;
        var content = self.rom.content;
        bytes = new Array(content.length);
        self.bytes = bytes;
        for(var i = 0, len = content.length; i < len; i++)
            bytes[i] = content[i];
        numBanks = (content.length / 8192) | 0;
    }

    this.powerOn = function() {
        bank1Offset = bank2Offset = bank3Offset = bank4Offset = -0x4000;
    };

    this.write = function(address, value) {
        // bank 1 is fixed at 0x0000
        if (address >= 0x6000 && address < 0x7fff)
            bank2Offset = (value % numBanks) * 0x2000 - 0x6000;
        else if (address >= 0x8000 && address < 0x9fff)
            bank3Offset = (value % numBanks) * 0x2000 - 0x8000;
        else if (address >= 0xa000 && address < 0xbfff)
            bank4Offset = (value % numBanks) * 0x2000 - 0xa000;
    };

    this.read = function(address) {
        if (address < 0x6000)
            return bytes[bank1Offset + address];        // May underflow if address < 0x4000
        else if (address < 0x8000)
            return bytes[bank2Offset + address];
        else if (address < 0xa000)
            return bytes[bank3Offset + address];
        else
            return bytes[bank4Offset + address];
    };


    var bytes;
    this.bytes = null;

    var bank1Offset;
    var bank2Offset;
    var bank3Offset;
    var bank4Offset;
    var numBanks;

    this.rom = null;
    this.format = wmsx.SlotFormats.Konami;


    // Savestate  -------------------------------------------

    this.saveState = function() {
        return {
            f: this.format.name,
            r: this.rom.saveState(),
            b: wmsx.Util.compressInt8BitArrayToStringBase64(bytes),
            b1: bank1Offset,
            b2: bank2Offset,
            b3: bank3Offset,
            b4: bank4Offset,
            n: numBanks
        };
    };

    this.loadState = function(s) {
        this.rom = wmsx.ROM.loadState(s.r);
        bytes = wmsx.Util.uncompressStringBase64ToInt8BitArray(s.b, bytes);
        this.bytes = bytes;
        bank1Offset = s.b1;
        bank2Offset = s.b2;
        bank3Offset = s.b3;
        bank4Offset = s.b4;
        numBanks = s.n;
    };


    if (rom) init(this);

};

wmsx.CartridgeKonami.prototype = wmsx.Slot.base;

wmsx.CartridgeKonami.recreateFromSaveState = function(state, previousSlot) {
    var cart = previousSlot || new wmsx.CartridgeKonami();
    cart.loadState(state);
    return cart;
};
