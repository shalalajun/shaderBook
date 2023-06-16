#include <common>
#include <packing>

#include <lights_pars_begin>

#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>

uniform vec3 uColor;
uniform float uGlossiness;
uniform sampler2D uMap;
uniform vec3 uShadowColor;
uniform float uUseMap;
//shaderMaterial 은 #ifdef등을 사용하지 못하기 때문에 uUseMap이라는 유니폼을 사용해서 분기를 적용한다.
varying vec3 vNormal;
varying vec3 vViewDir;
varying vec2 vUv;

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

  float lightIntensity =max((NdotL * shadow),0.0) *0.5+0.5;

  //vec3 directionalLight = directionalLights[0].color * lightIntensity;

  vec3 directionalLight = mix(uShadowColor,directionalLights[0].color, vec3(lightIntensity));



  vec3 halfVector = normalize(directionalLights[0].direction + vViewDir);
  float NdotH = clamp(dot(vNormal, halfVector),0.0,1.0);

  float specularIntensity = pow(NdotH * lightIntensity, 100.0 / uGlossiness);
  float specularIntensitySmooth = smoothstep(0.05, 0.1, specularIntensity);

  vec3 specular = specularIntensitySmooth * vec3(1.0,1.0,1.0);
  
  vec4 tex = texture2D(uMap, vUv);

  vec3 finalColor = uColor * (directionalLight + ambientLightColor + specular );

  if(uUseMap > 0.5) {
    finalColor *= tex.rgb;
  }
  
  gl_FragColor = vec4(finalColor, 1.0);
}