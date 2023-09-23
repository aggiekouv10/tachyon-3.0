module.exports = {
    "apps": [
        {
            "script": "./raffles/sneaktorious.js",
            "watch": true,
            "max_memory_restart": "1000M",
            "error_file": "/dev/null",
            "out_file": "/dev/null"
        },
        {
            "script": "./adidas/base1.js",
            "watch": true,
            "max_memory_restart": "1000M",
            "error_file": "/dev/null",
            "out_file": "/dev/null"
        }
    ]
}