import base64
import openai
from typing import Dict, Any, Optional
import os

# Import Qwen and Advanced Image Encoder modules
try:
    from qwen_image_analyzer import get_qwen_analyzer
    QWEN_AVAILABLE = True
except ImportError:
    print("⚠️ Qwen module not available")
    QWEN_AVAILABLE = False

try:
    from advanced_image_encoder import advanced_encoder
    ADVANCED_ENCODER_AVAILABLE = True
except ImportError:
    print("⚠️ Advanced image encoder module not available")
    ADVANCED_ENCODER_AVAILABLE = False

class ImageAnalysisAgent:
    def __init__(self):
        """Initialize the Image Analysis Agent with available models and encoders."""
        self.client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.qwen_available = QWEN_AVAILABLE
        self.advanced_encoder_available = ADVANCED_ENCODER_AVAILABLE
        
        # Initialize Qwen analyzer if available
        self.qwen_analyzer = None
        if self.qwen_available:
            try:
                self.qwen_analyzer = get_qwen_analyzer()
            except Exception as e:
                print(f"❌ Failed to initialize Qwen analyzer: {e}")
                self.qwen_available = False
    
    def analyze_image(self, image_data: bytes, prompt: str = "", encoding_type: str = "base64", 
                     use_qwen: bool = True, content_type: str = "image/jpeg") -> Dict[str, Any]:
        """
        Analyze an image using available models and encoders.
        
        Args:
            image_data: Raw image data as bytes
            prompt: User's specific analysis request
            encoding_type: Type of encoding to use (base64, enhanced_base64, feature_extraction, hybrid)
            use_qwen: Whether to prefer Qwen model over OpenAI
            content_type: MIME type of the image
            
        Returns:
            Dictionary containing analysis results and metadata
        """
        try:
            # Encode image using Advanced Image Encoder if available
            encoding_info = {"method": "base64", "success": True}
            if self.advanced_encoder_available and encoding_type != "base64":
                try:
                    encoding_result = advanced_encoder.encode_image(image_data, encoding_type)
                    if 'error' not in encoding_result:
                        encoding_info = {
                            "method": encoding_result["metadata"]["method"],
                            "success": True,
                            "format": encoding_result["metadata"]["format"],
                            "size": encoding_result["metadata"]["encoded_size"],
                            "dimensions": encoding_result["metadata"]["dimensions"],
                            "compression_ratio": encoding_result.get("compression_ratio", 0)
                        }
                        print(f"🔧 Image encoded using {encoding_info['method']}")
                    else:
                        print(f"❌ Advanced encoding failed: {encoding_result['error']}")
                        encoding_info = {"method": "base64", "success": True}
                except Exception as e:
                    print(f"❌ Advanced encoding failed, falling back to base64: {e}")
                    encoding_info = {"method": "base64", "success": True}
            
            # Analyze image using Qwen if available, otherwise fallback to OpenAI
            if use_qwen and self.qwen_available and self.qwen_analyzer:
                try:
                    analysis_result = self.qwen_analyzer.analyze_image(image_data, prompt)
                    
                    if analysis_result["success"]:
                        analysis = analysis_result["analysis"]
                        model_used = "Qwen2-VL-7B-Instruct"
                        device_used = analysis_result["device"]
                    else:
                        # Fallback to OpenAI if Qwen fails
                        analysis = self._analyze_with_openai(image_data, prompt, content_type)
                        model_used = "GPT-4o (fallback)"
                        device_used = "OpenAI API"
                        
                except Exception as e:
                    print(f"❌ Qwen analysis failed, falling back to OpenAI: {e}")
                    analysis = self._analyze_with_openai(image_data, prompt, content_type)
                    model_used = "GPT-4o (fallback)"
                    device_used = "OpenAI API"
            else:
                # Use OpenAI directly
                analysis = self._analyze_with_openai(image_data, prompt, content_type)
                model_used = "GPT-4o"
                device_used = "OpenAI API"
            
            if not analysis:
                analysis = "Unable to analyze the image. Please try again."
            
            return {
                "analysis": analysis,
                "model_used": model_used,
                "device_used": device_used,
                "encoding_info": encoding_info,
                "qwen_available": self.qwen_available,
                "advanced_encoder_available": self.advanced_encoder_available,
                "success": True
            }
            
        except Exception as e:
            print(f"Error analyzing image: {e}")
            return {
                "error": "Failed to analyze image",
                "success": False
            }
    
    def _analyze_with_openai(self, image_data: bytes, prompt: str, content_type: str) -> str:
        """
        Fallback function to analyze image using OpenAI GPT-4o.
        """
        try:
            image_base64 = base64.b64encode(image_data).decode('utf-8')
            
            # Prepare the analysis prompt
            if prompt:
                analysis_prompt = f"Please analyze this and provide a detailed explanation. User's specific request: {prompt}"
            else:
                analysis_prompt = """Please analyze this and provide a comprehensive explanation. Include:
                explain what the image is about without mentioning the image name


Please be thorough and analytical in your response."""
            
            # Create messages for OpenAI
            messages = [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": analysis_prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/{content_type.split('/')[-1]};base64,{image_base64}"
                            }
                        }
                    ]
                }
            ]
            
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                max_tokens=1500,
                temperature=0.3
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"Error in OpenAI analysis: {e}")
            return f"Error analyzing image with OpenAI: {str(e)}"
    
    def get_analysis_info(self) -> Dict[str, Any]:
        """
        Get information about available image analysis models and encoders.
        """
        try:
            info = {
                "qwen_available": self.qwen_available,
                "advanced_encoder_available": self.advanced_encoder_available,
                "openai_available": True,  # Always available as fallback
                "models": {
                    "qwen": {
                        "name": "Qwen2-VL-7B-Instruct",
                        "available": self.qwen_available,
                        "description": "Qwen2-VL is a large vision-language model for image understanding and analysis",
                        "source": "Hugging Face"
                    },
                    "openai": {
                        "name": "GPT-4o",
                        "available": True,
                        "description": "OpenAI's GPT-4o model with vision capabilities",
                        "source": "OpenAI API"
                    }
                },
                "encoders": {
                    "base64": {
                        "name": "Base64",
                        "available": True,
                        "description": "Standard base64 encoding for images"
                    },
                    "advanced_encoder": {
                        "name": "Advanced Image Encoder",
                        "available": self.advanced_encoder_available,
                        "description": "Advanced image encoding using Advanced Image Encoder"
                    }
                }
            }
            
            # Add Advanced Image Encoder info if available
            if self.advanced_encoder_available:
                try:
                    advanced_encoder_info = advanced_encoder.get_encoding_info()
                    info["encoders"]["advanced_encoder"].update(advanced_encoder_info)
                except Exception as e:
                    print(f"Error getting Advanced Image Encoder info: {e}")
            
            return info
            
        except Exception as e:
            print(f"Error getting image analysis info: {e}")
            return {"error": "Failed to get analysis info"}
    
    def simple_analysis(self, image_data: bytes) -> str:
        """
        Perform a simple image analysis using the default method.
        """
        result = self.analyze_image(image_data)
        if result.get("success"):
            return result["analysis"]
        else:
            return "Unable to analyze the image."
    
    def validate_image(self, image_data: bytes, content_type: str) -> Dict[str, Any]:
        """
        Validate if the provided data is a valid image.
        """
        try:
            # Check if content type indicates an image
            if not content_type.startswith('image/'):
                return {
                    "valid": False,
                    "error": "File must be an image"
                }
            
            # Try to decode the image to check if it's valid
            try:
                from PIL import Image
                from io import BytesIO
                image = Image.open(BytesIO(image_data))
                image.verify()  # Verify the image
                
                return {
                    "valid": True,
                    "format": image.format,
                    "size": image.size,
                    "mode": image.mode
                }
            except Exception as e:
                return {
                    "valid": False,
                    "error": f"Invalid image format: {str(e)}"
                }
                
        except Exception as e:
            return {
                "valid": False,
                "error": f"Error validating image: {str(e)}"
            } 