import * as THREE from 'three'
import vertexShader from '../shaders/vertexShader.vert'
import fragmentShader from '../shaders/flipBookFragment.frag'

class FlipBookShader extends THREE.ShaderMaterial {
    constructor(
        {
            map = null,
            tileHorize = 1,
            tileVertical = 1
        } = {}
    )
    {
        super({
            lights: true,
            uniforms: {
              uMap: { value: map },
              time: { value: 0 },
              tileHorize: { value: tileHorize },
              tileVertical: { value: tileVertical }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
          });
    }

    setMap(map) {
        this.uniforms.uMap.value = map;
        this.uniforms.uUseMap.value = map ? 1.0 : 0.0;
      }
    
    updateTime(deltaTime) {
        this.uniforms.time.value += deltaTime;
        }
}

export default FlipBookShader