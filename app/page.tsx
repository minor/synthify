"use client";
import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useEdgeStore } from "./lib/edgestore";
import OpenAI from "openai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

const openai = new OpenAI();

export default function Home() {
  const [dataType, setDataType] = useState("tabular");
  const [inputText, setInputText] = useState("");
  const [tabularData, setTabularData] = useState("");
  const [imageDataDescription, setImageDataDescription] = useState("");
  const [apiResponse, setApiResponse] = useState("");
  const [generatedImageUrls, setGeneratedImageUrls] = useState<string[]>([]); // State to store the generated image URLs

  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File>();
  const { edgestore } = useEdgeStore();

  const handleGenerateTabular = async () => {
    setIsLoading(true);
    let prompt;
    if (dataType === "tabular") {
      prompt = `I would like you to create more synthetic data for the following dataset, which is delimited by three dashes (-). The primary purpose of synthetic data is to provide a substitute for real data through prediction. This synthetic data should mimic the characteristics of the real data, but should not contain information from the actual data. Produce a deep dataset of synthetic data that is at least double the size of the input data. The synthetic data should be about: ${inputText}. Regardless of if it's possible to create "accurate" synthetic data, make sure your response is solely synthetic data and no other text.\n---Data: ${tabularData}\m---`;
    } else {
      prompt = inputText;
    }

    try {
      const response = await model.generateContent(prompt);
      const text = response.response.text();
      console.log("Response:", text);
      setApiResponse(text);
    } catch (error) {
      console.error("Error generating data:", error);
    }
    setIsLoading(false);
  };

  const handleFileUpload = async (file: File) => {
    try {
      setIsLoading(true);
      // Upload file to edgestore
      const response = await edgestore.myPublicImages.upload({ file });
      console.log("File uploaded to edgestore:", response);
      console.log(response.url);

      // // upload file to gemini
      // const uploadResult = await fileManager.uploadFile(response.url, {
      //   mimeType: "image/jpeg",
      //   displayName: "Image",
      // });

      // // view the response
      // console.log(
      //   `Uploaded file to Gemini ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`
      // );

      setIsLoading(false);
    } catch (error) {
      console.error("Error uploading file to edgestore:", error);
      setIsLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    setIsLoading(true);
    let prompt;
    if (dataType === "tabular") {
      prompt = `${imageDataDescription}`;
    } else {
      prompt = imageDataDescription;
    }

    try {
      const generatedUrls = [];
      for (let i = 0; i < 10; i++) {
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1024",
        });
        const imageUrl = response.data[0].url;
        if (imageUrl) {
          generatedUrls.push(imageUrl);
        }
      }
      setGeneratedImageUrls(generatedUrls);
      setIsLoading(false);
    } catch (error) {
      console.error("Error generating data:", error);
      setIsLoading(false);
    }
  };

  return (
    <main className="antialiased min-h-screen bg-gray-50 text-gray-900">
      <div className="relative">
        <div
          className="pointer-events-none absolute left-1/2 top-0 z-10 h-[400px] w-[1000px] -translate-x-1/2 -translate-y-1/2 opacity-[0.15]"
          style={{
            backgroundImage: "radial-gradient(#A4A4A3, transparent 50%)",
          }}
        ></div>
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full stroke-gray-400/80 opacity-50 [mask-image:radial-gradient(100%_100%_at_top_center,white,transparent)]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="83fd4e5a-9d52-42fc-97b6-718e5d7ee527"
              width="200"
              height="200"
              x="50%"
              y="-1"
              patternUnits="userSpaceOnUse"
            >
              <path d="M100 200V.5M.5 .5H200" fill="none"></path>
            </pattern>
          </defs>
          <svg x="50%" y="-1" className="overflow-visible fill-gray-50">
            <path
              d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z"
              strokeWidth={0}
            ></path>
          </svg>
          <rect
            width="100%"
            height="100%"
            strokeWidth={0}
            fill="url(#83fd4e5a-9d52-42fc-97b6-718e5d7ee527)"
          ></rect>
        </svg>
        <div className="mx-auto max-w-2xl pt-64 text-center">
          <div className="relative mx-4 sm:mx-0 flex flex-col">
            <h1 className="relative mb-4 text-5xl font-semibold">
              Generate{" "}
              <span className="bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400 text-transparent bg-clip-text">
                multi-modal
              </span>{" "}
              synthetic data with ease.
            </h1>
            <p className="text-xl max-w-xl mx-auto text-center text-gray-600">
              Give us a small data sample along with a prompt of the data that
              you'd like and we'll get state-of-the-art LLMs to generate
              synthetic data for your next project.
            </p>
          </div>
          <div className="mt-8">
            <div className="flex justify-center gap-4">
              <button
                className={`px-6 py-2 rounded-lg font-semibold ${
                  dataType === "tabular"
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
                onClick={() => setDataType("tabular")}
              >
                Tabular Dataset
              </button>
              <button
                className={`px-6 py-2 rounded-lg font-semibold ${
                  dataType === "image"
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
                onClick={() => setDataType("image")}
              >
                Image Dataset
              </button>
            </div>
            {dataType === "tabular" ? (
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="What type of synthetic tabular data are you looking for?"
                  className="w-3/4 p-2 border rounded"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <div className="mt-4">
                  <textarea
                    placeholder="Paste your tabular data here"
                    className="w-3/4 h-64 p-2 border rounded resize-none"
                    value={tabularData}
                    onChange={(e) => setTabularData(e.target.value)}
                  ></textarea>
                </div>
                <button
                  className="bg-indigo-400 mt-2 text-white px-6 py-2 rounded-lg font-semibold"
                  onClick={handleGenerateTabular}
                >
                  {isLoading ? "Generating..." : "Generate"}
                </button>
                {apiResponse && ( // only render if apiResponse actually exists
                  <div className="mt-4 text-gray-700 pb-8">
                    <h3 className="text-gray-700 font-semibold">
                      Your Generated Synthetic Data:
                    </h3>
                    {apiResponse}
                    <button className="bg-indigo-400 mt-8 text-white px-6 py-2 rounded-lg font-semibold">
                      Quality Test Data
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="What type of synthetic image dataset are you looking for?"
                  className="w-3/4 p-2 border rounded"
                  value={imageDataDescription}
                  onChange={(e) => setImageDataDescription(e.target.value)}
                />
                <div className="mt-4 flex items-center justify-center w-full">
                  <label
                    htmlFor="dropzone-file"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-4 text-gray-500"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                      >
                        <path
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        SVG, PNG, JPG or GIF (MAX. 10 images)
                      </p>
                    </div>
                    <input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      accept="image/svg+xml, image/png, image/jpeg, image/gif"
                      multiple
                      onChange={(e) => {
                        const uploadedFile = e.target.files?.[0];
                        if (uploadedFile) {
                          setFile(uploadedFile);
                          // Call handleFileUpload function
                          handleFileUpload(uploadedFile);
                        }
                      }}
                    />
                  </label>
                </div>
                <button
                  className="bg-indigo-400 mt-4 text-white px-6 py-2 rounded-lg font-semibold"
                  onClick={handleGenerateImage}
                >
                  {isLoading ? "Generating..." : "Generate"}
                </button>
                {generatedImageUrls.length > 0 && ( // Render images only if URLs exist
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-2 gap-4 pb-8">
                    {generatedImageUrls.map((imageUrl, index) => (
                      <div key={index}>
                        <img
                          src={imageUrl}
                          alt={`Generated Image ${index + 1}`}
                        />
                      </div>
                    ))}
                    <button className="bg-indigo-400 mt-8 text-white px-6 py-2 rounded-lg font-semibold">
                      Quality Test Data
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
