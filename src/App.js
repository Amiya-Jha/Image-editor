import React, { useState } from "react";
import "./App.css";
import Slider from "./Slider";
import SidebarItem from "./SidebarItem";

const DEFAULT_OPTIONS = [
  {
    name: "Brightness",
    property: "brightness",
    value: 100,
    range: {
      min: 0,
      max: 200,
    },
    unit: "%",
  },
  {
    name: "Contrast",
    property: "contrast",
    value: 100,
    range: {
      min: 0,
      max: 200,
    },
    unit: "%",
  },
  {
    name: "Saturation",
    property: "saturate",
    value: 100,
    range: {
      min: 0,
      max: 200,
    },
    unit: "%",
  },
  {
    name: "Grayscale",
    property: "grayscale",
    value: 0,
    range: {
      min: 0,
      max: 100,
    },
    unit: "%",
  },
  {
    name: "Sepia",
    property: "sepia",
    value: 0,
    range: {
      min: 0,
      max: 100,
    },
    unit: "%",
  },
  {
    name: "Hue Rotate",
    property: "hue-rotate",
    value: 0,
    range: {
      min: 0,
      max: 360,
    },
    unit: "deg",
  },
  {
    name: "Blur",
    property: "blur",
    value: 0,
    range: {
      min: 0,
      max: 20,
    },
    unit: "px",
  },
  {
    name: "Opacity",
    property: "opacity",
    value: 100,
    range: {
      min: 0,
      max: 100,
    },
    unit: "%",
  },
  {
    name: "Invert Colors",
    property: "invert",
    value: 0,
    range: {
      min: 0,
      max: 100,
    },
    unit: "%",
  },
];

function App() {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);

  const selectedOption = options[selectedOptionIndex];

  function handleSliderChange({ target }) {
    setOptions((prevOptions) => {
      return prevOptions.map((option, index) => {
        if (index !== selectedOptionIndex) return option;
        return { ...option, value: target.value };
      });
    });
  }

  function handleFileChange(event) {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(URL.createObjectURL(file));
    }
  }

  function handleReset() {
    // Reset all editing options to their default values
    setOptions(DEFAULT_OPTIONS);
    setIsFlipped(false);
    setRotationAngle(0);
  }

  function handleDownload() {
    const image = new Image();
    image.src = selectedFile || "/Default-img.jpg";

    image.onload = async () => {
      // Create a canvas element to draw the edited image
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      // Set canvas dimensions to match the image
      canvas.width = image.width;
      canvas.height = image.height;

      // Apply flip and rotation transformations
      context.save();
      if (isFlipped) {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }
      context.translate(canvas.width / 2, canvas.height / 2);
      context.rotate((rotationAngle * Math.PI) / 180);
      context.translate(-canvas.width / 2, -canvas.height / 2);

      // Apply filters to the image directly using createImageBitmap
      const bitmap = await createImageBitmap(
        image,
        0,
        0,
        image.width,
        image.height,
        {
          imageSmoothingEnabled: false,
        }
      );
      context.filter = options
        .map((option) => `${option.property}(${option.value}${option.unit})`)
        .join(" ");
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      // Restore the transformation
      context.restore();

      // Create a download link
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "edited_image.png";

      // Trigger a click on the link to start the download
      link.click();
    };
  }

  function handleFlip() {
    setIsFlipped(!isFlipped);
  }

  function handleRotate() {
    setRotationAngle((prevAngle) => (prevAngle + 90) % 360);
  }

  function getImageStyle() {
    const filters = options.map((option) => {
      return `${option.property}(${option.value}${option.unit})`;
    });

    const transformStyle = `scaleX(${
      isFlipped ? -1 : 1
    }) rotate(${rotationAngle}deg)`;

    return { filter: filters.join(" "), transform: transformStyle };
  }

  return (
    <div className="container">
      <div className="image-container">
        <div
          className="main-image"
          style={{
            backgroundImage: `url(${selectedFile || "/Default-img.jpg"})`,
            ...getImageStyle(),
          }}
        />
      </div>
      <div className="sidebar">
        {options.map((option, index) => {
          return (
            <SidebarItem
              key={index}
              name={option.name}
              active={index === selectedOptionIndex}
              handleClick={() => setSelectedOptionIndex(index)}
            />
          );
        })}
        {/* Move the buttons inside the sidebar */}
        <button className="button" onClick={handleFlip}>
          Flip
        </button>
        <button className="button" onClick={handleRotate}>
          Rotate
        </button>
        <button className="button reset-button" onClick={handleReset}>
          Reset
        </button>
        <label htmlFor="file" className="file-input-label button">
          Choose Image
        </label>
        <input
          id="file"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="file-input"
        />
        <button className="button download-button" onClick={handleDownload}>
          Download
        </button>
      </div>
      <Slider
        min={selectedOption.range.min}
        max={selectedOption.range.max}
        value={selectedOption.value}
        handleChange={handleSliderChange}
      />
    </div>
  );
}

export default App;
