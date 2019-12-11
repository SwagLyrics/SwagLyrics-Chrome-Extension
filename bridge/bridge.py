import os
import struct
import sys
import tempfile

# Paths for the files used for communication with the Chrome extension
get_data = os.path.join(tempfile.gettempdir(), "get_data")
last_played = os.path.join(tempfile.gettempdir(), "last_played")

if sys.platform == "win32":
    import msvcrt
    msvcrt.setmode(sys.stdin.fileno(), os.O_BINARY)
    msvcrt.setmode(sys.stdout.fileno(), os.O_BINARY)

def read_thread_func():
    while True:
        # Wait till the get_data data changes and return its values
        last_changed = os.path.getmtime(get_data)
        while True:
            if os.path.getmtime(get_data) != last_changed:
                break

        # Ask Chrome extension for the track-artist data
        sys.stdout.buffer.write(struct.pack('I', len('{"text":"get_data"}')))

        sys.stdout.write('{"text":"get_data"}')
        sys.stdout.flush()

        # Read the data from the Chrome extension
        text_length_bytes = sys.stdin.buffer.read(4)
        text_length = struct.unpack('i', text_length_bytes)[0]
        text = sys.stdin.buffer.read(text_length).decode('utf-8')

        # Save it to last_played so SwSpotify can access it
        with open(last_played, "w", encoding="utf-8") as f:
            f.write(text)

if __name__ == '__main__':
    read_thread_func()
    sys.exit(0)
