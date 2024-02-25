import fs from "fs/promises";
import { join } from "path";
import { PACKAGE_OUTPUT } from "config";
import { prebuild } from "builders/common/prebuild";
import { getLibraryDirectory, removePackageOutput } from "builders/utils";

export const build = async () => {
  const folder = "extension-assets";
  const libDirectory = getLibraryDirectory(folder);

  try {
    // Prebuild integrity checks.
    //--------------------------------------------------
    if (!(await prebuild(folder))) {
      throw `Prebuild failed.`;
    }

    // Generate package content to PACKAGE_OUTPUT.
    //--------------------------------------------------

    // Create output directory.
    fs.mkdir(`${libDirectory}/${PACKAGE_OUTPUT}`, { recursive: true });

    // Generate svg and jsx files from raw source files.
    await generateIcons(
      `${libDirectory}/src/`,
      `${libDirectory}/${PACKAGE_OUTPUT}/`
    );

    // Use raw info.json files to generate `index.js` file.
    await generateIndexFile(
      `${libDirectory}/src/`,
      `${libDirectory}/${PACKAGE_OUTPUT}/`
    );

    // Generate package.json.
    //--------------------------------------------------
    // TODO: generate to `PACKAGE_OUTPUT`, using `PACKAGE_SCOPE` and folder name for "name".

    console.log(`✅ Package successfully built.`);
  } catch (err) {
    // Tidy up on error.
    //--------------------------------------------------
    console.error(`❌ Error occurred while building the package.`, err);

    // Remove package output directory if it exists.
    if (!(await removePackageOutput(libDirectory))) {
      console.error(`❌ Failed to remove package output directory.`);
    }
  }
};

// Copy SVG icons from a source directory to the package directory.
const generateIcons = async (sourceDir: string, destDir: string) => {
  try {
    const subDirs = await fs.readdir(sourceDir);

    for (const subDir of subDirs) {
      const subDirPath = join(sourceDir, subDir);
      const stats = await fs.stat(subDirPath);

      if (stats.isDirectory()) {
        const iconPath = join(subDirPath, "icon.svg");

        try {
          await fs.access(iconPath);
          const destFileSvg = join(destDir, `${subDir}.svg`);
          const destFileJsx = join(destDir, `${subDir}.jsx`);

          // Copy SVG file.
          await fs.copyFile(iconPath, destFileSvg);

          // Generate React component from SVG file.
          await createReactComponentFromSvg(iconPath, destFileJsx, subDir);
        } catch (err) {
          // If 'icon.svg' doesn't exist in the subdirectory, ignore it
          if (err.code !== "ENOENT") {
            throw err;
          }
        }
      }
    }
  } catch (err) {
    console.error("❌  Error copying icons:", err);
  }
};
// Create a React component from an SVG file.
const createReactComponentFromSvg = async (
  svgFilePath: string,
  outputPath: string,
  componentName: string
) => {
  try {
    const svgContent = await fs.readFile(svgFilePath, "utf8");
    const reactComponent = generateReactComponent(svgContent, componentName);

    await fs.writeFile(outputPath, reactComponent);
  } catch (err) {
    console.error("Error:", err);
  }
};

// Generates React component markup for an SVG file.
const generateReactComponent = (
  svgContent: string,
  componentName = "SvgComponent"
) => `function ${componentName}() {
  return (
    ${svgContent}
  );
}

export default ${componentName};
`;

// Generate index file from `info.json` source files.
const generateIndexFile = async (directoryPath: string, outputPath: string) => {
  try {
    const folders = await fs.readdir(directoryPath);
    const indexData = {};

    for (const folder of folders) {
      const folderPath = join(directoryPath, folder);
      const infoPath = join(folderPath, "info.json");

      try {
        const infoContent = await fs.readFile(infoPath, "utf8");
        const info = JSON.parse(infoContent);

        // Use `id` field as the key in the index file, and rmeove it from the object.
        const { id } = info;
        delete info.id;
        indexData[id] = info;
      } catch (error) {
        console.error(
          `Error reading or parsing info.json for folder '${folder}':`,
          error
        );
      }
    }

    const indexFileContent = `module.exports = ${JSON.stringify(indexData, null, 4)};\n`;
    await fs.writeFile(join(outputPath, "index.js"), indexFileContent);
  } catch (error) {
    console.error("❌ Error generating index.js file:", error);
  }
};
