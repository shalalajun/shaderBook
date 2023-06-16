import * as THREE from 'three'
import vertexShader from '../shaders/vertexShader.vert'
import fragmentShader from '../shaders/fragmentShader.frag'

class StyleShader extends THREE.ShaderMaterial {
    constructor({
        color = '#ffffff', 
        glossiness = 0.5, 
        shadowColor = new THREE.Color(0, 0, 0), 
        map = null,
      } = {}) {
        super({
          lights: true,
          uniforms: { 
            ...THREE.UniformsLib['lights'],
            uColor: { value: new THREE.Color(color) },
            uGlossiness: { value: glossiness },
            uShadowColor: { value: shadowColor },
            uMap: { value: map },
            uUseMap: { value: map ? 1.0 : 0.0 },
            uMedThreshold: { value: 0.484 },
            uMedSmooth: { value: 0.0},
            uShadowThreshold: { value: 0.471 },
            uShadowSmooth: { value: 0.017},
          },
          vertexShader: vertexShader,
          fragmentShader: fragmentShader
        });
      }
    
      setColor(color) {
        this.uniforms.uColor.value = new THREE.Color(color);
      }
    
      setGlossiness(glossiness) {
        this.uniforms.uGlossiness.value = glossiness;
      }
    
      setShadowColor(color) {
        this.uniforms.uShadowColor.value = new THREE.Color(color);
      }

      setMap(map) {
        this.uniforms.uMap.value = map;
        this.uniforms.uUseMap.value = map ? 1.0 : 0.0;
      }
    
}

export default StyleShader;
