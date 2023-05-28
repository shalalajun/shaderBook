#include <common>
#include <packing>

#include <lights_pars_begin>

#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>

uniform vec3 uColor;
uniform float uGlossiness;
uniform float dotScale;
uniform vec2 fragCoord;

varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vPosition;

void main() {

  DirectionalLightShadow directionalShadow = directionalLightShadows[0];

  float shadow = getShadow(
    directionalShadowMap[0],
    directionalShadow.shadowMapSize,
    directionalShadow.shadowBias,
    directionalShadow.shadowRadius,
    vDirectionalShadowCoord[0]
  );

  

  float NdotL = dot(vNormal, directionalLights[0].direction);

  vec2 dotPosition = gl_FragCoord.xy/fragCoord.xy * dotScale;
  float dotInterval = (sin(dotPosition.x) * 0.5 + 0.5) + (sin(dotPosition.y) * 0.5 + 0.5);

  float dotBright;

    if(NdotL > 0.6){
        dotBright = 1.0;
    }else if(NdotL > 0.2){
        dotBright = 0.6;
    }else{
        dotBright = 0.4;
    }


    
  float lightIntensity =max((NdotL * shadow),0.0);

  vec3 directionalLight = directionalLights[0].color * lightIntensity;



  // vec3 halfVector = normalize(directionalLights[0].direction + vViewDir);
  // float NdotH = clamp(dot(vNormal, halfVector),0.0,1.0);

  // float specularIntensity = pow(NdotH * lightIntensity, 100.0 / uGlossiness);
  // float specularIntensitySmooth = smoothstep(0.05, 0.1, specularIntensity);

  // vec3 specular = specularIntensitySmooth * vec3(1.0,1.0,1.0);

    gl_FragColor = vec4(uColor * (directionalLight + vec3(dotInterval)) * dotBright, 1.0);
  
  //  gl_FragColor = vec4(uColor * (directionalLight + ambientLightColor + specular ), 1.0);
}