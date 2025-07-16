import mongoose, { Document, Schema, Types } from 'mongoose';

// Define the interface for the details of the generated content
interface IGeneratedDetails {
    textInput?: string;
    speakerFilename?: string;
    generatedAudioPath?: string; // Path on FastAPI server
    sourceImageFilename?: string;
    refEyeblinkFilename?: string;
    generatedVideoUrl?: string; // The URL you return to the frontend
    // Add any other relevant details you want to store
}

// Define the interface for a GeneratedContent document
export interface IGeneratedContent extends Document {
    userId: Types.ObjectId; // Reference to the User who performed the action
    type: 'voice_synthesis' | 'avatar_generation'; // Type of action
    timestamp: Date;
    details: IGeneratedDetails; // Details specific to the generation
}

// Define the GeneratedContent Schema
const GeneratedContentSchema: Schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Refers to the 'User' model you provided
        required: true,
        index: true // Index for faster lookup by user
    },
    type: {
        type: String,
        enum: ['voice_synthesis', 'avatar_generation'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    details: { // Using an embedded object for flexibility
        textInput: { type: String },
        speakerFilename: { type: String },
        generatedAudioPath: { type: String },
        sourceImageFilename: { type: String },
        refEyeblinkFilename: { type: String },
        generatedVideoUrl: { type: String },
        // Add more specific fields as needed
    }
});

// Create and export the Mongoose model
export default mongoose.model<IGeneratedContent>('GeneratedContent', GeneratedContentSchema);