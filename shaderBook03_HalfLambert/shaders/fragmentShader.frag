#include <common>
#include <packing>

#include <lights_pars_begin>

#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>

uniform vec3 uColor;
uniform float uGlossiness;

varying vec3 vNormal;
varying vec3 vViewDir;

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

  //하프램버트를하는 법을 알아내다.

  vec3 directionalLight = directionalLights[0].color * lightIntensity;







  vec3 halfVector = normalize(directionalLights[0].direction + vViewDir);
  float NdotH = clamp(dot(vNormal, halfVector),0.0,1.0);

  // float specularIntensity = pow(NdotH * lightIntensity, 100.0 / uGlossiness);
  // float specularIntensitySmooth = smoothstep(0.05, 0.1, specularIntensity);

  // vec3 specular = specularIntensity * vec3(1.0,1.0,1.0);
  
   gl_FragColor = vec4(uColor * (directionalLight + ambientLightColor ), 1.0);
}