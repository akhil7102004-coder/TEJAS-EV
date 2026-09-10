import sys, base64

def write_b64(filepath, mode, b64_str):
    data = base64.b64decode(b64_str).decode('utf-8')
    with open(filepath, mode, encoding='utf-8') as f:
        f.write(data)

if __name__ == '__main__':
    filepath = sys.argv[1]
    mode = sys.argv[2]
    b64_str = sys.argv[3]
    write_b64(filepath, mode, b64_str)
