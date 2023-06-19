import * as THREE from 'three'

export default class FlipBookAni
{
    constructor(spriteTexture, tileHorize, tileVertical)
    {
        // note: texture passed by reference, will be updated by the update function.
        this.texture = spriteTexture;
        //this.texture.flipY = false
        this.texture.magFilter = THREE.NearestFilter;
        spriteTexture.wrapS = spriteTexture.wrapT = THREE.RepeatWrapping; 
        this.texture.repeat.set(1/tileHorize, 1/tileVertical);

        this.currentTile = 0
        this.tileHorize = 0
        this.tileVertical = 0


        this.tileHorize = tileHorize;
        this.tileVertical = tileVertical;


        this.playSpriteIndices = []
        this.runningTileArrayIndex = 0
        this.maxDisplayTime = 0
        this.elapsedTime = 0

    }

    loop(playSpriteIndices, totalduration)
    {
        this.playSpriteIndices = playSpriteIndices
        this.runningTileArrayIndex = 0
        this.currentTile = playSpriteIndices[this.runningTileArrayIndex]
        this.maxDisplayTime = totalduration / this.playSpriteIndices.length
    }

    update(delta)
    {
        this.elapsedTime += delta
        
        if(this.maxDisplayTime > 0 && this.elapsedTime >= this.maxDisplayTime)
        {
            this.elapsedTime = 0
            this.runningTileArrayIndex = (this.runningTileArrayIndex + 1) % this.playSpriteIndices.length
            this.currentTile = this.playSpriteIndices[this.runningTileArrayIndex]
     
            const offsetX = (this.currentTile % this.tileHorize) / this.tileHorize
            const offsetY = (this.tileVertical + Math.floor(this.currentTile / this.tileHorize)-this.tileHorize) / this.tileVertical
            this.texture.offset.x = offsetX
            this.texture.offset.y = offsetY
        }
    }
}