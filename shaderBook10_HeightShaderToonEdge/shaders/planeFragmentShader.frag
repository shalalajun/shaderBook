#include <common>
#include <packing>

#include <lights_pars_begin>

#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>

uniform vec3 uColor;
uniform float uGlossiness;

uniform vec3 bottomColor;
uniform vec3 topColor;
uniform float minHeight;
uniform float maxHeight;
varying vec3 vPosition;

varying vec3 vNormal;
varying vec3 vViewDir;

void main() {

  float yNormalized = (vPosition.z - minHeight) / (maxHeight - minHeight);
  vec3 color = mix(bottomColor, topColor, yNormalized);

  DirectionalLightShadow directionalShadow = directionalLightShadows[0];

  float shadow = getShadow(
    directionalShadowMap[0],
    directionalShadow.shadowMapSize,
    directionalShadow.shadowBias,
    directionalShadow.shadowRadius,
    vDirectionalShadowCoord[0]
  );


  float NdotL = dot(vNormal, directionalLights[0].direction);

  float lightIntensity =max((NdotL * shadow),0.0) * 0.5 + 0.5;

  //하프램버트를하는 법을 알아내다.

  vec3 directionalLight = color * lightIntensity;

  vec3 halfVector = normalize(directionalLights[0].direction + vViewDir);
  float NdotH = clamp(dot(vNormal, halfVector),0.0,1.0);

  float specularIntensity = pow(NdotH * lightIntensity, 300.0 / uGlossiness);
 //float specularIntensitySmooth = smoothstep(0.05, 0.1, specularIntensity);

  vec3 specular = specularIntensity * vec3(1.0,1.0,1.0);
  
   gl_FragColor = vec4((directionalLight + ambientLightColor + specular), 1.0);
}