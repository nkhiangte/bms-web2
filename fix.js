import { Jimp } from 'jimp';

async function fix() {
    console.log('Loading icon...');
    // wait Jimp expects a Buffer or path
    const image = await Jimp.read('assets/icon.png');
    // Jimp usually rewrites to a clean PNG representation
    await image.write('assets/icon.png');
    
    const bg = await Jimp.read('assets/icon-background.png');
    await bg.write('assets/icon-background.png');
    
    console.log('Fixed icon.png and icon-background.png');
}

fix().catch(console.error);
