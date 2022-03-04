#!/bin/bash
VER=$1
if [ -z $2 ];then
	NAME=$VER
else
	NAME=$2
fi
cd ../v8
git reset --hard $VER
gclient sync -D
gn gen out/x86_$NAME.release --args='v8_monolithic=true v8_use_external_startup_data=false is_component_build=false is_debug=false target_cpu="x86" use_goma=false goma_dir="None" v8_enable_backtrace=true v8_enable_disassembler=true v8_enable_object_print=true v8_enable_verify_heap=true'
ninja -C out/x86_$NAME.release d8


