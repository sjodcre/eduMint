import { createDataItemSigner, connect, dryrun, message, result } from '@permaweb/aoconnect';
import type { TagType } from '@/shared/types';
import { toast } from '@/components/ui/use-toast';

// Utility function to delay execution
const DEFAULT_RESULT_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export const delay = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Function to spawn an AO process with a timeout.
 * @param {any} wallet - The user's Arweave wallet.
 * @param {TagType[]} assetTags - Tags to include in the AO process.
 * @param {any} buffer - The video file data buffer.
 * @param {number} [timeoutMs=30000] - The timeout duration in milliseconds.
 * @returns {Promise<string>} - Resolves with the process ID or throws an error.
 */
export const spawnProcessWithTimeout = async (
    wallet: any,
    assetTags: TagType[],
    buffer: any,
    timeoutMs: number = 30000
): Promise<string> => {
    const aos = connect();

    const spawnTimeout = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error("aos.spawn() timed out")), timeoutMs)
    );

    try {
        console.log("Starting AO spawn process...");
        const spawnPromise: Promise<string> = aos.spawn({
            module: "Pq2Zftrqut0hdisH_MC2pDOT6S4eQFoxGsFUzR6r350",
            scheduler: "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA",
            signer: createDataItemSigner(wallet),
            tags: assetTags,
            data: buffer,
        });

        // Use Promise.race to set a timeout limit for the spawn operation
        const processId = await Promise.race([spawnPromise, spawnTimeout]);

        if (!processId) {
            throw new Error("Process ID is null or undefined");
        }

        console.log(`Asset process spawned successfully: ${processId}`);
        return processId;
    } catch (error) {
        console.error("Spawn process failed:", error);
        throw new Error(`Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
};

/**
 * Performs an AO dryrun with a timeout and retry logic.
 * @param {string} processId - The ID of the process to dryrun.
 * @param {TagType[]} tags - Array of tags to include in the dryrun.
 * @param {any} data - Data to include in the dryrun.
 * @param {number} [timeoutMs=20000] - Timeout duration in milliseconds (default: 20s).
 * @returns {Promise<any>} - Resolves with the dryrun response or rejects on timeout/error.
 */
export const dryrunWithTimeout = async (
    processId: string,
    tags: TagType[],
    data: any,
    timeoutMs: number = 20000
): Promise<any> => {
    let attempts = 0;

    while (attempts < MAX_RETRIES) {
        try {
            console.log(`Dryrun attempt ${attempts + 1} for process ${processId}`);

            // Promise to timeout the request if it takes too long
            const dryrunTimeout = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error("dryrun() timed out")), timeoutMs)
            );

            const dryrunPromise = dryrun({
                process: processId,
                tags: tags,
                data: JSON.stringify(data || {}),
            });

            const response = await Promise.race([dryrunPromise, dryrunTimeout]);

            if (!response || !response.Messages) {
                console.error("Invalid response received from dryrunWithTimeout", response);
                throw new Error("Failed to fetch posts, please try again.");
            }

            if (response?.Messages) {
                return response; // Return valid response if received
            }

        } catch (error) {
            console.warn(`Dryrun attempt ${attempts + 1} failed:`, error);
            attempts++;
            await new Promise((resolve) => setTimeout(resolve, 2 ** attempts * 2000));

            if (attempts >= MAX_RETRIES) {
                console.error("Max retries reached. Failed to fetch posts.");
                toast({ description: "Failed to fetch posts after multiple attempts.", variant: "destructive" });
                throw new Error("Failed to fetch posts after multiple attempts.");
            }
        }

    }
};

export async function sendMessageWithTimeout(
    processId: string,
    tags: TagType[],
    signer: any,
    data: any = "",
    timeout: number = 20000
): Promise<any> {
    const messagePromise = message({
        process: processId,
        tags,
        signer: createDataItemSigner(signer),
        data,
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("message() timed out")), timeout)
    );

    try {
        // return await Promise.race([messagePromise, timeoutPromise]);
        const response = await Promise.race([messagePromise, timeoutPromise]);

        if (!response) {
            console.error("Invalid response received from sendMessageWithTimeout", response);
            toast({ description: "Failed to send message, please try again.", variant: "destructive" });
            throw new Error("Failed to send message, please try again.");
        }

        return response;
    } catch (error) {
        console.error(`Message process failed:`, error);
        throw error;
    }
}


export async function fetchResultWithTimeout(
    processId: string,
    message: any,
    timeout: number = DEFAULT_RESULT_TIMEOUT
): Promise<any> {
    const resultPromise = result({
        process: processId,
        message,
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("result() request timed out")), timeout)
    );

    try {
        // return await Promise.race([resultPromise, timeoutPromise]);
        const response = await Promise.race([resultPromise, timeoutPromise]);

        if (!response || !response.Messages) {
            console.error("Invalid response received from fetchResultWithTimeout", response);
            toast({ description: "Failed to fetch result, please try again.", variant: "destructive" });
            throw new Error("Failed to fetch result, please try again.");
        }

        return response;
    } catch (error) {
        console.error(`Result fetching failed:`, error);
        throw error;
    }
}