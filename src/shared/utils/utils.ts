import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";
// import { Buffer } from 'buffer';


export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

// export async function fileToBuffer(file: File): Promise<Buffer> {
// 	return new Promise((resolve, reject) => {
// 		const reader = new FileReader();

// 		reader.onload = () => {
// 			const arrayBuffer = reader.result as ArrayBuffer;
// 			const buffer = Buffer.from(arrayBuffer);
// 			resolve(buffer);
// 		};

// 		reader.onerror = (error) => {
// 			reject(error);
// 		};

// 		reader.readAsArrayBuffer(file);
// 	});
// }

export async function fileToBuffer(file: File): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const arrayBuffer = reader.result as ArrayBuffer;
            const uint8Array = new Uint8Array(arrayBuffer);
            resolve(uint8Array);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
}

export function cleanProcessField(value: string) {
	let updatedValue: string;
	updatedValue = value.replace(/\[|\]/g, '');
	return `[[${updatedValue}]]`;
}