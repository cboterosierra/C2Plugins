﻿// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Rex_Lzstring = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Rex_Lzstring.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	
	var typeProto = pluginProto.Type.prototype;

	typeProto.onCreate = function()
	{
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	instanceProto.onCreate = function()
	{
        this._webstorage_obj = null;
        this._save_fn = null;
        this._load_fn = null;
        this._key_exist_fn = null;
	    this.fake_ret = {value:0,
	                     set_any: function(value){this.value=value;},
	                     set_int: function(value){this.value=value;},	 
                         set_float: function(value){this.value=value;},	 
                         set_string: function(value){this.value=value;},	    
	                    };  	
	};
	
	instanceProto.webstorage_get = function ()
	{   	 
        if (this._webstorage_obj != null)
            return this._webstorage_obj;      
            
	    assert2(cr.plugins_.WebStorage, "LZ string: Could not find webstorage.");
        var plugins = this.runtime.types;
        this._save_fn = cr.plugins_.WebStorage.prototype.acts.StoreLocal;
        this._load_fn = cr.plugins_.WebStorage.prototype.exps.LocalValue;
        this._key_exist_fn = cr.plugins_.WebStorage.prototype.cnds.LocalStorageExists;
        var name, plugin;
        for (name in plugins)
        {
            plugin = plugins[name];
            if (plugin.plugin.acts.StoreLocal == this._save_fn)
            {
                this._webstorage_obj = plugin.instances[0];
                break;
            }                                          
        }
        
        return this._webstorage_obj;
	};
    
    instanceProto.load_value = function (key)
    {
        var webstorage_obj = this.webstorage_get();
        this._load_fn.call(webstorage_obj, this.fake_ret, key);
        return this.fake_ret.value;
    };
    
    instanceProto.save_value = function (key, value)
    {
        var webstorage_obj = this.webstorage_get();
        this._save_fn.call(webstorage_obj, key, value);
    };	
    
    instanceProto.key_exist = function (key)
    {
        var webstorage_obj = this.webstorage_get();
        return this._key_exist_fn.call(webstorage_obj, key);
    };  
	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	pluginProto.cnds = new Cnds();    

	//////////////////////////////////////
	// Actions
	function Acts() {};
	pluginProto.acts = new Acts();
	
	Acts.prototype.StoreLocal = function(key, data)
	{
		this.save_value(key, window["LZString"]["compress"](data));
	};
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

    Exps.prototype.Compress = function (ret, s)
	{
	    ret.set_string( window["LZString"]["compress"](s) );
	};
    Exps.prototype.Decompress = function (ret, s)
	{
	    ret.set_string( window["LZString"]["decompress"](s) );
	};    
	
    Exps.prototype.LocalValue = function (ret, _key, _default)
	{
	    var v;
	    if (this.key_exist(_key))
	    {
			v = window["LZString"]["decompress"]( this.load_value(_key) );
	    }
	    else
	    {
	        v = _default;
	        this.save_value(_key, window["LZString"]["compress"](_default));
	    }
	    ret.set_any( v );
	};	
}());