from argparse import ArgumentParser
from pathlib import Path
import tkinter as tk
from PIL import Image, ImageTk
import json, sys


def main():
    argparser = ArgumentParser()
    argparser.add_argument('file', type=Path)
    args = argparser.parse_args()

    input_file = args.file.resolve()

    # Function to handle mouse clicks
    def on_click(event):
        nonlocal coordinates, image
        coordinates.append((event.x / image.width, event.y / image.height))

    # Function to close the window and print coordinates
    def on_close():
        nonlocal root
        print(json.dumps(coordinates, indent=4))
        root.destroy()

    # Initialize the main window
    root = tk.Tk()
    root.title("Image Click Coordinates")

    # Load an image file
    image = Image.open(str(input_file))
    photo = ImageTk.PhotoImage(image)

    # Create a label to display the image
    label = tk.Label(root, image=photo)
    label.pack()

    # List to store coordinates
    coordinates = []

    # Bind the click event to the on_click function
    label.bind("<Button-1>", on_click)

    # Set the close event to the on_close function
    root.protocol("WM_DELETE_WINDOW", on_close)

    # Start the main loop
    root.mainloop()

if __name__ == '__main__':
    sys.exit(main())
